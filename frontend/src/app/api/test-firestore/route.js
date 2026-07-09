import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "users"));

    return Response.json({
      success: true,
      documents: snapshot.size,
    });
  } catch (error) {
    return Response.json({
      success: false,
      code: error.code,
      message: error.message,
    });
  }
}