const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// --- Email setup using environment variables ---
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailEmail, pass: gmailPassword }
});

// --- Firestore trigger: notify first approver when a new request is created ---
exports.notifyApprover1 = functions.firestore
    .document("Requests/{requestId}")
    .onCreate(async (snap, context) => {
        const request = snap.data();
        const dept = request.department;

        // Get first approver for that department
        const approverSnapshot = await admin.firestore()
            .collection("Accounts")
            .where("department", "==", dept)
            .where("role", "==", "approver")
            .orderBy("username")  // ensure approvers are in correct stage order
            .limit(1)
            .get();

        if (approverSnapshot.empty) return null;

        const approver = approverSnapshot.docs[0].data();

        const mailOptions = {
            from: gmailEmail,
            to: approver.email,
            subject: `New Request Pending Approval`,
            text: `Hi ${approver.username},\n\nYou have a new request from ${request.submittedBy} in ${dept} department.\nPlease review it in your dashboard.`
        };

        return transporter.sendMail(mailOptions);
    });

// --- Firestore trigger: notify next approver when status changes ---
exports.notifyNextApprover = functions.firestore
    .document("Requests/{requestId}")
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const dept = after.department;

        // --- Approver 1 approved → notify Approver 2 ---
        if (before.status.approver1 === "Pending" && after.status.approver1 === "Approved") {
            const approver2Snapshot = await admin.firestore()
                .collection("Accounts")
                .where("department", "==", dept)
                .where("role", "==", "approver")
                .orderBy("username")
                .offset(1) // second approver
                .limit(1)
                .get();

            if (!approver2Snapshot.empty) {
                const approver2 = approver2Snapshot.docs[0].data();
                const mailOptions = {
                    from: gmailEmail,
                    to: approver2.email,
                    subject: `Request Pending Your Approval`,
                    text: `Hi ${approver2.username},\n\nThe request from ${after.submittedBy} has been approved by the first approver.\nPlease review it in your dashboard.`
                };
                await transporter.sendMail(mailOptions);
            }
        }

        // --- Approver 2 approved → notify Final approver ---
        if (before.status.approver2 === "Pending" && after.status.approver2 === "Approved") {
            const finalApproverSnapshot = await admin.firestore()
                .collection("Accounts")
                .where("role", "==", "approver") // or final approver role if defined
                .orderBy("username")
                .offset(2) // third/final approver
                .limit(1)
                .get();

            if (!finalApproverSnapshot.empty) {
                const finalApprover = finalApproverSnapshot.docs[0].data();
                const mailOptions = {
                    from: gmailEmail,
                    to: finalApprover.email,
                    subject: `Request Pending Final Approval`,
                    text: `Hi ${finalApprover.username},\n\nThe request from ${after.submittedBy} has been approved by the second approver.\nPlease review it in your dashboard.`
                };
                await transporter.sendMail(mailOptions);
            }
        }

        // --- Optionally: notify requestor if rejected at any stage ---
        const stages = ["approver1","approver2","final"];
        for(const stage of stages){
            if(before.status[stage]==="Pending" && after.status[stage]==="Rejected"){
                const requestorDoc = await admin.firestore().collection("Accounts").doc(after.userId).get();
                const requestor = requestorDoc.data();
                const mailOptions = {
                    from: gmailEmail,
                    to: requestor.email,
                    subject: `Your Request Has Been Rejected`,
                    text: `Hi ${requestor.username},\n\nYour request submitted on ${after.timestamp?.toDate().toLocaleString() || ''} has been rejected at stage: ${stage}.\nPlease contact your approver for details.`
                };
                await transporter.sendMail(mailOptions);
            }
        }

        return null;
    });

// --- Optional: Test HTTP function ---
exports.testEmail = functions.https.onRequest(async (req,res)=>{
    const mailOptions = {
        from: gmailEmail,
        to: "recipient@example.com",
        subject: "Test Email",
        text: "This is a test from Firebase Cloud Functions."
    };
    try{
        await transporter.sendMail(mailOptions);
        res.send("Email sent successfully!");
    }catch(error){
        console.error(error);
        res.status(500).send(error.toString());
    }
});
