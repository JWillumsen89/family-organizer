// fetchData.js
import { db } from '../config/firebaseConfig';
import { query, collection, where, onSnapshot } from 'firebase/firestore';

export const fetchData = (userEmail, setOrganizers) => {
    // Closure to hold the current state of organizers
    let currentOrganizers = new Map();

    const handleSnapshotUpdate = snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            currentOrganizers.set(doc.id, { id: doc.id, ...data });
        });

        const sortedOrganizers = Array.from(currentOrganizers.values()).sort((a, b) => a.name.localeCompare(b.name));
        setOrganizers(sortedOrganizers);
    };

    const createdByQuery = query(collection(db, 'organizers'), where('createdBy', '==', userEmail));
    const sharedWithQuery = query(collection(db, 'organizers'), where('sharedWith', 'array-contains', userEmail));

    const unsubscribeCreatedBy = onSnapshot(createdByQuery, handleSnapshotUpdate);
    const unsubscribeSharedWith = onSnapshot(sharedWithQuery, handleSnapshotUpdate);

    return () => {
        unsubscribeCreatedBy();
        unsubscribeSharedWith();
    };
};
