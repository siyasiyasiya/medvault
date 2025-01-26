import { getSession } from '@auth0/nextjs-auth0';
import fetch from 'node-fetch';  

export async function GET(req) {
  const session = await getSession(req);

  if (!session) {
    return new Response(
      JSON.stringify({ message: 'Not authenticated' }),
      { status: 401 }
    );
  }

  const userId = session.user.sub; 

  const accessToken = process.env.AUTH0_API_ACCESS_TOKEN; 

  try {
    const response = await fetch(`https://dev-v2zdda77azddmj2r.us.auth0.com/api/v2/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    const userData = await response.json();
    const accountType = userData.user_metadata?.account_type || null;

    return new Response(
      JSON.stringify({ user: userData, accountType }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return new Response(
      JSON.stringify({ message: 'Server error' }),
      { status: 500 }
    );
  }
}
