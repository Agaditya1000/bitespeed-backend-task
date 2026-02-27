"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileIdentity = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const reconcileIdentity = async (email, phoneNumber) => {
    // 1. Find all contacts that match either email or phoneNumber
    const matchingContacts = await client_1.default.contact.findMany({
        where: {
            OR: [
                ...(email ? [{ email }] : []),
                ...(phoneNumber ? [{ phoneNumber }] : []),
            ],
        },
        orderBy: { createdAt: 'asc' }, // ensures oldest is first
    });
    // Case 1: No existing contacts found
    if (matchingContacts.length === 0) {
        const newContact = await client_1.default.contact.create({
            data: {
                email,
                phoneNumber,
                linkPrecedence: 'primary',
            },
        });
        return formatResponse(newContact, []);
    }
    // Find all related contacts to the matches
    // A match could be a secondary, so we need its primary, or it's a primary with secondaries.
    const allRelatedIds = new Set();
    matchingContacts.forEach((c) => {
        allRelatedIds.add(c.id);
        if (c.linkedId)
            allRelatedIds.add(c.linkedId);
    });
    // Fetch the full cluster of contacts
    const clusterContacts = await client_1.default.contact.findMany({
        where: {
            OR: [
                { id: { in: Array.from(allRelatedIds) } },
                { linkedId: { in: Array.from(allRelatedIds) } },
            ],
        },
        orderBy: { createdAt: 'asc' },
    });
    // The first one in the sorted cluster is our true primary
    const primaryContact = clusterContacts[0];
    const otherContacts = clusterContacts.slice(1);
    // Determine if we need to link existing primaries together (Merging)
    const primariesToMerge = otherContacts.filter((c) => c.linkPrecedence === 'primary');
    if (primariesToMerge.length > 0) {
        await client_1.default.$transaction(async (tx) => {
            for (const p of primariesToMerge) {
                await tx.contact.update({
                    where: { id: p.id },
                    data: {
                        linkPrecedence: 'secondary',
                        linkedId: primaryContact.id,
                    },
                });
                // Also update any secondaries pointing to the old primary
                await tx.contact.updateMany({
                    where: { linkedId: p.id },
                    data: { linkedId: primaryContact.id },
                });
            }
        });
        // Refresh cluster after updates
        const updatedCluster = await client_1.default.contact.findMany({
            where: {
                OR: [{ id: primaryContact.id }, { linkedId: primaryContact.id }],
            },
            orderBy: { createdAt: 'asc' },
        });
        return formatResponse(updatedCluster[0], updatedCluster.slice(1));
    }
    // Case 2/3: Check if new info was provided
    const clusterEmails = new Set(clusterContacts.map((c) => c.email).filter(Boolean));
    const clusterPhones = new Set(clusterContacts.map((c) => c.phoneNumber).filter(Boolean));
    const isNewEmail = email && !clusterEmails.has(email);
    const isNewPhone = phoneNumber && !clusterPhones.has(phoneNumber);
    if (isNewEmail || isNewPhone) {
        // We have new information, create a secondary contact
        const newSecondary = await client_1.default.contact.create({
            data: {
                email: email || undefined,
                phoneNumber: phoneNumber || undefined,
                linkedId: primaryContact.id,
                linkPrecedence: 'secondary',
            },
        });
        clusterContacts.push(newSecondary);
    }
    // Return the consolidated cluster
    return formatResponse(primaryContact, clusterContacts.filter(c => c.id !== primaryContact.id));
};
exports.reconcileIdentity = reconcileIdentity;
const formatResponse = (primary, secondaries) => {
    const emails = new Set();
    if (primary.email)
        emails.add(primary.email);
    const phoneNumbers = new Set();
    if (primary.phoneNumber)
        phoneNumbers.add(primary.phoneNumber);
    const secondaryContactIds = [];
    secondaries.forEach((sec) => {
        if (sec.email)
            emails.add(sec.email);
        if (sec.phoneNumber)
            phoneNumbers.add(sec.phoneNumber);
        secondaryContactIds.push(sec.id);
    });
    return {
        primaryContactId: primary.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds,
    };
};
