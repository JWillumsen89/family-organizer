// fetchData.js
import { db } from '../config/firebaseConfig';
import { query, collection, onSnapshot } from 'firebase/firestore';

export const fetchData = (userEmail, setOrganizers, organizers) => {
    let currentOrganizers = new Map(organizers.map(org => [org.id, org]));

    const handleSnapshotUpdate = snapshot => {
        snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const docId = change.doc.id;

            if (change.type === 'added' || change.type === 'modified') {
                // Check if createdBy is the user or if sharedWith includes the user
                if (data.createdBy === userEmail || (data.sharedWith && data.sharedWith.includes(userEmail))) {
                    currentOrganizers.set(docId, { id: docId, ...data });
                }
            }
            if (
                change.type === 'removed' ||
                (change.type === 'modified' && data.sharedWith && !data.sharedWith.includes(userEmail) && data.createdBy !== userEmail)
            ) {
                // Remove organizer if it's deleted or no longer shared with or created by the user
                currentOrganizers.delete(docId);
            }
        });

        const sortedOrganizers = Array.from(currentOrganizers.values()).sort((a, b) => a.name.localeCompare(b.name));
        setOrganizers(sortedOrganizers);
    };

    // Listen to all changes in the 'organizers' collection
    const organizersQuery = query(collection(db, 'organizers'));
    const unsubscribe = onSnapshot(organizersQuery, handleSnapshotUpdate);

    return unsubscribe;
};

export const fetchEventsForOrganizers = (setItemsForOrganizer, organizers) => {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef);

    const handleSnapshotUpdate = snapshot => {
        let allFetchedEvents = [];

        snapshot.docChanges().forEach(change => {
            const eventData = change.doc.data();

            if (change.type === 'added' || change.type === 'modified') {
                allFetchedEvents.push({
                    name: eventData.name,
                    height: 120,
                    description: eventData.description,
                    day: eventData.day,
                    endDate: eventData.end_date,
                    color: eventData.color,
                    startTime: eventData.start_time,
                    endTime: eventData.end_time,
                    organizers: eventData.organizers,
                    creator: eventData.creator,
                });
            }

            if (change.type === 'removed') {
                allFetchedEvents = allFetchedEvents.filter(event => event.name !== eventData.name);
            }
        });

        const organizerIds = new Set(organizers.map(org => org.id));

        let groupedEvents = {};

        for (const evt of allFetchedEvents) {
            const dateStr = evt.day;
            if (!groupedEvents[dateStr]) {
                groupedEvents[dateStr] = [];
            }
            groupedEvents[dateStr].push(evt);
        }

        for (const dateStr in groupedEvents) {
            groupedEvents[dateStr] = sortEventsByTime(groupedEvents[dateStr]);
        }

        setItemsForOrganizer(groupedEvents);
    };

    const unsubscribe = onSnapshot(q, handleSnapshotUpdate);

    return unsubscribe;
};

const sortEventsByTime = events => {
    return events.sort((a, b) => {
        const startComparison = a.startTime.localeCompare(b.startTime);
        if (startComparison !== 0) {
            return startComparison;
        }
        return a.endTime.localeCompare(b.endTime);
    });
};
