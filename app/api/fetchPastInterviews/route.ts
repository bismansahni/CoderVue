import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY || "{}")),
    });
}
const db = getFirestore();

// Function to fetch past interviews from Firestore
async function fetchPastInterviews(userId: string) {
    try {
        const interviewsSnapshot = await db
            .collection("users")
            .doc(userId)
            .collection("interviews")
            .get();

        if (interviewsSnapshot.empty) {
            return [];
        }

        const interviews = interviewsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return interviews;
    } catch (error) {
        console.error("Error fetching past interviews:", error);
        throw new Error("Failed to fetch past interviews.");
    }
}

// Export the POST handler for Next.js API route
export async function POST(req: NextRequest) {
    try {
        // Parse request body to get userId
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: "The 'userId' field is required." },
                { status: 400 }
            );
        }

        console.log("userId:", userId);


        const result = await fetchPastInterviews(userId);

        return NextResponse.json({ interviews: result });
    } catch (error) {
        console.error("Error in POST /fetchPastInterviews:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching the interview data." },
            { status: 500 }
        );
    }
}
