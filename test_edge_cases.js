

const hitApi = async (body, stepName) => {
    console.log(`\n--- Running Step: ${stepName} ---`);
    const res = await fetch('http://localhost:3000/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
    return json;
};

const runTests = async () => {
    try {
        // 1. New contact
        await hitApi({ email: "alice@test.com", phoneNumber: "11111" }, "1. New Contact");

        // 2. Exact match (repeated request)
        await hitApi({ email: "alice@test.com", phoneNumber: "11111" }, "2. Exact Match / Repeated Request");

        // 3. New info (creates secondary)
        await hitApi({ email: "alice@test.com", phoneNumber: "22222" }, "3. New Phone / Existing Email -> Secondary");

        // 4. Only Email
        await hitApi({ email: "bob@test.com" }, "4. Only Email, New primary");

        // 5. Only Phone
        await hitApi({ phoneNumber: "33333" }, "5. Only Phone, New primary");

        // 6. Merge Primaries
        // Let's connect Bob and the isolated Phone primary implicitly
        await hitApi({ email: "bob@test.com", phoneNumber: "33333" }, "6. Merge Primaries (Connect Bob and 33333)");

        console.log("\n✅ All test steps completed.");
    } catch (err) {
        console.error("Test failed", err);
    }
};

runTests();
