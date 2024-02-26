import { db } from "../utils/firebase.js";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  getDocs,
} from "@firebase/firestore";

export const loadScores = async () => {
  const scoreQuery = query(collection(db, "scores"), orderBy("score", "desc"));

  const querySnapshot = await getDocs(scoreQuery);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};
