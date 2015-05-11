// Scores SECURITY
Scores.permit(['update', 'remove']).never().apply();
Scores.permit('insert').ifLoggedIn().apply();
