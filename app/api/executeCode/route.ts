




import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const { source_code, language_id, test_cases, expected_outputs } = await req.json();

        // Validate test_cases and expected_outputs to ensure they are arrays
        if (!Array.isArray(test_cases) || !Array.isArray(expected_outputs)) {
            throw new Error('Test cases or expected outputs are missing or invalid.');
        }

        const apiKey = process.env.JUDGE0_API_KEY;
        if (!apiKey) {
            throw new Error('JUDGE0_API_KEY is missing from environment variables');
        }

        // Combine test cases (stdin) and expected outputs
        const stdin = test_cases.join('\n');  // Join multiple test cases with newline
        const expected_output = expected_outputs.join('\n');  // Join expected outputs with newline

        // API request options
        const options = {
            method: 'POST',
            url: 'https://judge029.p.rapidapi.com/submissions',
            params: {
                base64_encoded: 'false',
                wait: 'false',  // Optionally change to 'true' if you want to wait for the result immediately
                fields: '*',
            },
            headers: {
                'x-rapidapi-key': apiKey,  // Use the apiKey from environment variables
                'x-rapidapi-host': 'judge029.p.rapidapi.com',
                'Content-Type': 'application/json',
            },
            data: {
                source_code,
                language_id,
                stdin,  // Submit the concatenated test cases
                expected_output,  // Submit the concatenated expected outputs
            },
        };

        // Make the API request to Judge0
        const response = await axios.request(options);

        // Return the API response (token) to the client
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error in Judge0 API:', error.response?.data || error.message);

        return NextResponse.json(
            { error: 'Failed to communicate with Judge0 API', details: error.response?.data || error.message },
            { status: error.response?.status || 500 }
        );
    }
}
