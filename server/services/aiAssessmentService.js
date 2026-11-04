/**
 * AI Accessibility Assessment Service
 * Provides automated, evidence-based accessibility assessments for public venues.
 * Integrates with Google Gemini API when GEMINI_API_KEY is configured,
 * and seamlessly provides a robust, expert heuristic assessment engine fallback.
 */

const https = require('https');

/**
 * Calculates a transparent facility-weighted accessibility readiness score (0-100)
 * and data completeness percentage.
 */
function calculateAccessibilityMetrics(place) {
  const profile = place.accessibilityProfile || {};
  const facilities = place.facilities || {};

  // Standard weights for core accessibility domains
  const domainWeights = [
    {
      name: 'Ramp & Step-free Entrance',
      weight: 25,
      isAvailable: facilities.wheelchairRamp === 'Available' || profile.ramp?.status === 'Verified Available' || profile.stepFreeEntrance?.status === 'Verified Available',
      isUnavailable: facilities.wheelchairRamp === 'Unavailable' || (profile.ramp?.status === 'Verified Unavailable' && profile.stepFreeEntrance?.status === 'Verified Unavailable'),
      isConflicting: profile.ramp?.status === 'Conflicting Reports' || profile.stepFreeEntrance?.status === 'Conflicting Reports',
      isUnknown: facilities.wheelchairRamp === 'Unknown' && (!profile.ramp?.status || profile.ramp?.status === 'Unknown' || profile.ramp?.status === 'Conflicting Reports')
    },
    {
      name: 'Elevator / Lift',
      weight: 20,
      isAvailable: facilities.elevatorLift === 'Available' || profile.lift?.status === 'Verified Available',
      isUnavailable: facilities.elevatorLift === 'Unavailable' || profile.lift?.status === 'Verified Unavailable',
      isConflicting: profile.lift?.status === 'Conflicting Reports',
      isUnknown: facilities.elevatorLift === 'Unknown' && (!profile.lift?.status || profile.lift?.status === 'Unknown' || profile.lift?.status === 'Conflicting Reports')
    },
    {
      name: 'Accessible Restroom',
      weight: 20,
      isAvailable: facilities.accessibleToilet === 'Available' || profile.accessibleToilet?.status === 'Verified Available',
      isUnavailable: facilities.accessibleToilet === 'Unavailable' || profile.accessibleToilet?.status === 'Verified Unavailable',
      isConflicting: profile.accessibleToilet?.status === 'Conflicting Reports',
      isUnknown: facilities.accessibleToilet === 'Unknown' && (!profile.accessibleToilet?.status || profile.accessibleToilet?.status === 'Unknown' || profile.accessibleToilet?.status === 'Conflicting Reports')
    },
    {
      name: 'Accessible Parking',
      weight: 15,
      isAvailable: facilities.accessibleParking === 'Available' || profile.accessibleParking?.status === 'Verified Available',
      isUnavailable: facilities.accessibleParking === 'Unavailable' || profile.accessibleParking?.status === 'Verified Unavailable',
      isConflicting: profile.accessibleParking?.status === 'Conflicting Reports',
      isUnknown: facilities.accessibleParking === 'Unknown' && (!profile.accessibleParking?.status || profile.accessibleParking?.status === 'Unknown' || profile.accessibleParking?.status === 'Conflicting Reports')
    },
    {
      name: 'Braille & Tactile Signage',
      weight: 10,
      isAvailable: facilities.brailleSignage === 'Available' || profile.brailleSignage?.status === 'Verified Available' || profile.tactilePaving?.status === 'Verified Available',
      isUnavailable: facilities.brailleSignage === 'Unavailable' && profile.tactilePaving?.status === 'Verified Unavailable',
      isConflicting: profile.brailleSignage?.status === 'Conflicting Reports',
      isUnknown: facilities.brailleSignage === 'Unknown' && (!profile.brailleSignage?.status || profile.brailleSignage?.status === 'Unknown' || profile.brailleSignage?.status === 'Conflicting Reports')
    },
    {
      name: 'Audio & Visual Assistance',
      weight: 10,
      isAvailable: facilities.audioAssistance === 'Available' || profile.audioAssistance?.status === 'Verified Available' || profile.visualAnnouncements?.status === 'Verified Available',
      isUnavailable: facilities.audioAssistance === 'Unavailable' && profile.visualAnnouncements?.status === 'Verified Unavailable',
      isConflicting: profile.audioAssistance?.status === 'Conflicting Reports',
      isUnknown: facilities.audioAssistance === 'Unknown' && (!profile.audioAssistance?.status || profile.audioAssistance?.status === 'Unknown' || profile.audioAssistance?.status === 'Conflicting Reports')
    }
  ];

  let earnedScore = 0;
  let auditedWeight = 0;
  let availableCount = 0;
  let unavailableCount = 0;
  let unknownCount = 0;
  let conflictingCount = 0;

  domainWeights.forEach((domain) => {
    if (domain.isConflicting) {
      conflictingCount++;
    }
    if (domain.isAvailable) {
      earnedScore += domain.weight;
      auditedWeight += domain.weight;
      availableCount++;
    } else if (domain.isUnavailable) {
      auditedWeight += domain.weight;
      unavailableCount++;
    } else {
      unknownCount++;
    }
  });

  const completeness = Math.round((auditedWeight / 100) * 100);
  const totalScore = Math.min(100, Math.max(0, earnedScore));

  let tier = 'Needs Assessment';
  if (completeness < 35) {
    tier = 'Insufficient Data';
  } else if (totalScore >= 75) {
    tier = 'High Accessibility';
  } else if (totalScore >= 45) {
    tier = 'Moderate Accessibility';
  } else {
    tier = 'Limited Accessibility';
  }

  return {
    score: totalScore,
    completeness,
    tier,
    availableCount,
    unavailableCount,
    unknownCount,
    conflictingCount,
    domains: domainWeights
  };
}

/**
 * Expert heuristic assessment generator
 */
function generateHeuristicAssessment(place, reviews = []) {
  const metrics = calculateAccessibilityMetrics(place);
  const profile = place.accessibilityProfile || {};
  const facilities = place.facilities || {};
  const notes = place.facilityNotes || {};

  const strengths = [];
  const barriers = [];
  const informationGaps = [];
  const recommendations = [];

  // Wheelchair & Physical Mobility
  if (facilities.wheelchairRamp === 'Available' || profile.ramp?.status === 'Verified Available') {
    strengths.push({
      facility: 'Wheelchair Ramp / Step-free Entrance',
      detail: notes.wheelchairRamp || 'Verified ramp provides wheelchair access into the main entrance.',
      icon: 'Ramp'
    });
  } else if (facilities.wheelchairRamp === 'Unavailable' || profile.ramp?.status === 'Verified Unavailable') {
    barriers.push({
      facility: 'Entrance Steps / No Ramp',
      detail: notes.wheelchairRamp || 'Entrance requires climbing steps with no ramp available. Wheelchair users require physical assistance.',
      severity: 'Critical'
    });
  } else {
    informationGaps.push('Ramp gradient and doorway threshold conditions have not been verified.');
  }

  // Lift / Multi-floor circulation
  if (facilities.elevatorLift === 'Available' || profile.lift?.status === 'Verified Available') {
    strengths.push({
      facility: 'Elevator / Lift Access',
      detail: notes.elevatorLift || 'Elevator operational for multi-level floor transition.',
      icon: 'Elevator'
    });
  } else if (facilities.elevatorLift === 'Unavailable' || profile.lift?.status === 'Verified Unavailable') {
    barriers.push({
      facility: 'No Elevator',
      detail: notes.elevatorLift || 'Multi-floor access requires stairs only.',
      severity: 'High'
    });
  } else {
    informationGaps.push('Upper floor accessibility and elevator dimensions are unconfirmed.');
  }

  // Accessible Restroom
  if (facilities.accessibleToilet === 'Available' || profile.accessibleToilet?.status === 'Verified Available') {
    strengths.push({
      facility: 'Accessible Restroom',
      detail: notes.accessibleToilet || 'Dedicated accessible restroom with wide entrance door and support rails.',
      icon: 'Restroom'
    });
  } else if (facilities.accessibleToilet === 'Unavailable' || profile.accessibleToilet?.status === 'Verified Unavailable') {
    barriers.push({
      facility: 'No Accessible Restroom',
      detail: notes.accessibleToilet || 'Restroom stalls do not accommodate standard wheelchairs or lack grab bars.',
      severity: 'High'
    });
  } else {
    informationGaps.push('Restroom door width and grab bar specifications are pending verification.');
  }

  // Accessible Parking
  if (facilities.accessibleParking === 'Available' || profile.accessibleParking?.status === 'Verified Available') {
    strengths.push({
      facility: 'Designated Accessible Parking',
      detail: notes.accessibleParking || 'Reserved accessible parking spaces close to main access routes.',
      icon: 'Parking'
    });
  } else if (facilities.accessibleParking === 'Unavailable') {
    barriers.push({
      facility: 'No Designated Accessible Parking',
      detail: 'Visitors must utilize general street or multi-bay parking which may involve distant transit.',
      severity: 'Medium'
    });
  }

  // Sensory: Braille / Audio
  if (facilities.brailleSignage === 'Available' || profile.brailleSignage?.status === 'Verified Available') {
    strengths.push({
      facility: 'Tactile & Braille Signage',
      detail: notes.brailleSignage || 'Braille markings present on primary directional boards or lift panels.',
      icon: 'Braille'
    });
  } else if (facilities.brailleSignage === 'Unavailable') {
    barriers.push({
      facility: 'Absence of Tactile/Braille Guidance',
      detail: 'Wayfinding signs rely entirely on visual text plaques.',
      severity: 'Medium'
    });
  }

  if (facilities.audioAssistance === 'Available' || profile.audioAssistance?.status === 'Verified Available') {
    strengths.push({
      facility: 'Audio Announcements / Assistance',
      detail: notes.audioAssistance || 'Audio assistance or staff guided navigation available upon arrival.',
      icon: 'Audio'
    });
  }

  // User Reviews Context Synthesis
  if (reviews && reviews.length > 0) {
    const helpfulReviews = reviews.filter((r) => r.comment && r.comment.length > 20);
    if (helpfulReviews.length > 0) {
      const topFeedback = helpfulReviews[0];
      recommendations.push({
        targetAudience: 'All Visitors',
        action: `Community Tip: "${topFeedback.comment.slice(0, 150)}${topFeedback.comment.length > 150 ? '...' : ''}"`
      });
    }
  }

  // Actionable recommendations based on gaps and venue category
  if (facilities.wheelchairRamp === 'Available') {
    recommendations.push({
      targetAudience: 'Wheelchair & Walker Users',
      action: 'Direct access to main lobby confirmed. Check ahead if accessing annex or garden areas.'
    });
  } else {
    recommendations.push({
      targetAudience: 'Wheelchair Users',
      action: 'Call the venue in advance to confirm if portable ramps or security assistance can be provided at entrance.'
    });
  }

  if (facilities.accessibleToilet !== 'Available') {
    recommendations.push({
      targetAudience: 'Visitors Requiring Accessible Facilities',
      action: 'Plan your visit with nearby accessible public restroom locations in mind.'
    });
  }

  if (facilities.brailleSignage !== 'Available') {
    recommendations.push({
      targetAudience: 'Visually Impaired Visitors',
      action: 'Requesting companion assistance or informing the reception desk upon entry is recommended.'
    });
  }

  return {
    source: 'Heuristic Accessibility Inference Engine',
    model: 'AccessAble-Audit-v2',
    evaluatedAt: new Date().toISOString(),
    metrics,
    summary: `AccessAble assessment for ${place.name} in ${place.city || 'Tamil Nadu'}. Overall accessibility profile is rated as ${metrics.tier} with a confidence index of ${metrics.completeness}%.`,
    strengths,
    barriers,
    informationGaps,
    recommendations,
    disclaimer:
      'This AI-synthesized assessment is generated algorithmically from documented field audits and community reports. Physical conditions may change over time; always confirm critical accessibility needs directly with the venue.'
  };
}

/**
 * Calls Gemini API if GEMINI_API_KEY is available, otherwise returns heuristic assessment.
 */
async function generateAIAssessment(place, reviews = []) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Always compute heuristic metrics as guaranteed baseline
  const heuristic = generateHeuristicAssessment(place, reviews);

  if (!geminiApiKey || geminiApiKey === 'demo_key' || geminiApiKey.startsWith('your_')) {
    return {
      ...heuristic,
      provider: 'Local AI Heuristic Engine (GEMINI_API_KEY not configured)'
    };
  }

  try {
    const prompt = `You are a certified professional accessibility auditor evaluating a public facility in Tamil Nadu, India.
Analyze the following venue data and produce a structured accessibility evaluation.

Place Name: ${place.name}
Category: ${place.category}
Address: ${place.address}, ${place.city}, ${place.district || 'Tamil Nadu'}
Facilities:
- Wheelchair Ramp: ${place.facilities?.wheelchairRamp || 'Unknown'} (Notes: ${place.facilityNotes?.wheelchairRamp || 'None'})
- Elevator / Lift: ${place.facilities?.elevatorLift || 'Unknown'} (Notes: ${place.facilityNotes?.elevatorLift || 'None'})
- Accessible Toilet: ${place.facilities?.accessibleToilet || 'Unknown'} (Notes: ${place.facilityNotes?.accessibleToilet || 'None'})
- Accessible Parking: ${place.facilities?.accessibleParking || 'Unknown'} (Notes: ${place.facilityNotes?.accessibleParking || 'None'})
- Braille Signage: ${place.facilities?.brailleSignage || 'Unknown'} (Notes: ${place.facilityNotes?.brailleSignage || 'None'})
- Audio Assistance: ${place.facilities?.audioAssistance || 'Unknown'} (Notes: ${place.facilityNotes?.audioAssistance || 'None'})

Community Review Summaries:
${reviews.map((r) => `- Rating: ${r.rating}/5, Accessibility: ${r.accessibilityRating}/5. Review: "${r.comment || 'No comment'}"`).slice(0, 5).join('\n') || 'None yet'}

Respond ONLY with valid JSON with this exact structure:
{
  "summary": "Brief 2-sentence executive summary of accessibility conditions.",
  "strengths": [
    { "facility": "Name of feature", "detail": "Specific reason why this helps visitors" }
  ],
  "barriers": [
    { "facility": "Name of barrier", "detail": "Why this obstructs visitors", "severity": "Critical" | "High" | "Medium" }
  ],
  "informationGaps": ["List of unverified facilities or missing audit details"],
  "recommendations": [
    { "targetAudience": "Wheelchair Users" | "Visually Impaired" | "General Visitors", "action": "Clear actionable visit tip" }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    const parsedGemini = await new Promise((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
          },
          timeout: 8000
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                const responseJson = JSON.parse(data);
                const textContent =
                  responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textContent) {
                  resolve(JSON.parse(textContent));
                } else {
                  reject(new Error('No text content in Gemini response'));
                }
              } else {
                reject(new Error(`Gemini HTTP Error ${res.statusCode}: ${data}`));
              }
            } catch (err) {
              reject(err);
            }
          });
        }
      );

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Gemini API call timed out'));
      });
      req.write(requestBody);
      req.end();
    });

    return {
      source: 'Google Gemini 1.5 Flash Accessibility Auditor',
      model: 'gemini-1.5-flash',
      evaluatedAt: new Date().toISOString(),
      metrics: heuristic.metrics,
      summary: parsedGemini.summary || heuristic.summary,
      strengths: parsedGemini.strengths?.length ? parsedGemini.strengths : heuristic.strengths,
      barriers: parsedGemini.barriers?.length ? parsedGemini.barriers : heuristic.barriers,
      informationGaps: parsedGemini.informationGaps?.length ? parsedGemini.informationGaps : heuristic.informationGaps,
      recommendations: parsedGemini.recommendations?.length ? parsedGemini.recommendations : heuristic.recommendations,
      disclaimer: heuristic.disclaimer
    };
  } catch (err) {
    console.warn('[AI Service] Gemini API call failed, using heuristic fallback:', err.message);
    return {
      ...heuristic,
      provider: 'Local AI Heuristic Engine (Gemini fallback)'
    };
  }
}

module.exports = {
  calculateAccessibilityMetrics,
  generateHeuristicAssessment,
  generateAIAssessment
};
