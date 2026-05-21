/**
 * Curated ICD-10-CM behavioral health codes — the codes admissions reps
 * encounter daily. Not exhaustive; picks the ~80 most-used codes across
 * mood, anxiety, trauma, SUD, eating, psychotic, personality, and
 * neurodevelopmental categories.
 *
 * Source: WHO ICD-10-CM (2026), public domain.
 */

export type Icd10Code = {
  code: string;
  description: string;
  category: string;
};

export const ICD10_BH: readonly Icd10Code[] = [
  // Depressive
  { code: "F32.0", description: "Major depressive disorder, single episode, mild", category: "Depressive" },
  { code: "F32.1", description: "MDD, single episode, moderate", category: "Depressive" },
  { code: "F32.2", description: "MDD, single episode, severe without psychotic features", category: "Depressive" },
  { code: "F32.3", description: "MDD, single episode, severe with psychotic features", category: "Depressive" },
  { code: "F32.9", description: "MDD, single episode, unspecified", category: "Depressive" },
  { code: "F33.0", description: "MDD, recurrent, mild", category: "Depressive" },
  { code: "F33.1", description: "MDD, recurrent, moderate", category: "Depressive" },
  { code: "F33.2", description: "MDD, recurrent, severe without psychotic features", category: "Depressive" },
  { code: "F33.3", description: "MDD, recurrent, severe with psychotic features", category: "Depressive" },
  { code: "F33.9", description: "MDD, recurrent, unspecified", category: "Depressive" },
  { code: "F34.1", description: "Persistent depressive disorder (Dysthymia)", category: "Depressive" },
  { code: "F34.81", description: "Disruptive mood dysregulation disorder", category: "Depressive" },

  // Bipolar
  { code: "F31.0", description: "Bipolar I, current episode hypomanic", category: "Bipolar" },
  { code: "F31.13", description: "Bipolar I, current manic, severe", category: "Bipolar" },
  { code: "F31.2", description: "Bipolar I, manic with psychotic features", category: "Bipolar" },
  { code: "F31.31", description: "Bipolar I, current depressed, mild", category: "Bipolar" },
  { code: "F31.4", description: "Bipolar I, current depressed, severe", category: "Bipolar" },
  { code: "F31.5", description: "Bipolar I, depressed with psychotic features", category: "Bipolar" },
  { code: "F31.81", description: "Bipolar II", category: "Bipolar" },
  { code: "F34.0", description: "Cyclothymic disorder", category: "Bipolar" },

  // Anxiety
  { code: "F41.0", description: "Panic disorder", category: "Anxiety" },
  { code: "F41.1", description: "Generalized anxiety disorder (GAD)", category: "Anxiety" },
  { code: "F41.9", description: "Anxiety disorder, unspecified", category: "Anxiety" },
  { code: "F40.10", description: "Social anxiety disorder", category: "Anxiety" },
  { code: "F40.00", description: "Agoraphobia, unspecified", category: "Anxiety" },
  { code: "F42.2", description: "OCD, mixed obsessional / compulsive", category: "Anxiety" },
  { code: "F42.9", description: "OCD, unspecified", category: "Anxiety" },

  // Trauma / Stressor
  { code: "F43.10", description: "Post-traumatic stress disorder, unspecified", category: "Trauma" },
  { code: "F43.11", description: "PTSD, acute", category: "Trauma" },
  { code: "F43.12", description: "PTSD, chronic", category: "Trauma" },
  { code: "F43.0", description: "Acute stress reaction", category: "Trauma" },
  { code: "F43.20", description: "Adjustment disorder, unspecified", category: "Trauma" },
  { code: "F43.21", description: "Adjustment disorder with depressed mood", category: "Trauma" },
  { code: "F43.22", description: "Adjustment disorder with anxiety", category: "Trauma" },
  { code: "F43.23", description: "Adjustment disorder with mixed anxiety & depressed mood", category: "Trauma" },
  { code: "F43.25", description: "Adjustment disorder with disturbance of conduct", category: "Trauma" },

  // SUD — alcohol
  { code: "F10.10", description: "Alcohol use, mild", category: "SUD" },
  { code: "F10.20", description: "Alcohol dependence, uncomplicated", category: "SUD" },
  { code: "F10.21", description: "Alcohol dependence, in remission", category: "SUD" },
  { code: "F10.230", description: "Alcohol withdrawal, uncomplicated", category: "SUD" },
  { code: "F10.231", description: "Alcohol withdrawal delirium", category: "SUD" },
  { code: "F10.239", description: "Alcohol withdrawal with perceptual disturbance", category: "SUD" },
  { code: "F10.929", description: "Alcohol use, unspecified with intoxication", category: "SUD" },

  // SUD — opioid
  { code: "F11.10", description: "Opioid use, mild", category: "SUD" },
  { code: "F11.20", description: "Opioid dependence, uncomplicated", category: "SUD" },
  { code: "F11.21", description: "Opioid dependence, in remission", category: "SUD" },
  { code: "F11.23", description: "Opioid dependence with withdrawal", category: "SUD" },
  { code: "F11.929", description: "Opioid use, unspecified with intoxication", category: "SUD" },

  // SUD — sedative / hypnotic / anxiolytic
  { code: "F13.20", description: "Sedative dependence, uncomplicated", category: "SUD" },
  { code: "F13.230", description: "Sedative withdrawal, uncomplicated", category: "SUD" },
  { code: "F13.239", description: "Sedative withdrawal with perceptual disturbance", category: "SUD" },

  // SUD — stimulant / cocaine
  { code: "F14.20", description: "Cocaine dependence, uncomplicated", category: "SUD" },
  { code: "F14.929", description: "Cocaine use with intoxication", category: "SUD" },
  { code: "F15.20", description: "Other stimulant dependence", category: "SUD" },
  { code: "F15.23", description: "Stimulant dependence with withdrawal", category: "SUD" },

  // SUD — cannabis / hallucinogen / other
  { code: "F12.10", description: "Cannabis use, mild", category: "SUD" },
  { code: "F12.20", description: "Cannabis dependence, uncomplicated", category: "SUD" },
  { code: "F16.20", description: "Hallucinogen dependence", category: "SUD" },
  { code: "F19.20", description: "Other psychoactive substance dependence", category: "SUD" },
  { code: "F19.230", description: "Other psychoactive substance withdrawal", category: "SUD" },

  // Eating disorders
  { code: "F50.00", description: "Anorexia nervosa, unspecified", category: "Eating" },
  { code: "F50.01", description: "Anorexia nervosa, restricting type", category: "Eating" },
  { code: "F50.02", description: "Anorexia nervosa, binge-eating / purging type", category: "Eating" },
  { code: "F50.2", description: "Bulimia nervosa", category: "Eating" },
  { code: "F50.81", description: "Binge eating disorder", category: "Eating" },
  { code: "F50.9", description: "Eating disorder, unspecified", category: "Eating" },

  // Psychotic
  { code: "F20.9", description: "Schizophrenia, unspecified", category: "Psychotic" },
  { code: "F25.0", description: "Schizoaffective disorder, bipolar type", category: "Psychotic" },
  { code: "F25.1", description: "Schizoaffective disorder, depressive type", category: "Psychotic" },
  { code: "F23", description: "Brief psychotic disorder", category: "Psychotic" },
  { code: "F29", description: "Unspecified psychosis", category: "Psychotic" },

  // Personality
  { code: "F60.2", description: "Antisocial personality disorder", category: "Personality" },
  { code: "F60.3", description: "Borderline personality disorder", category: "Personality" },
  { code: "F60.4", description: "Histrionic personality disorder", category: "Personality" },
  { code: "F60.5", description: "Obsessive-compulsive personality disorder", category: "Personality" },
  { code: "F60.6", description: "Avoidant personality disorder", category: "Personality" },
  { code: "F60.9", description: "Personality disorder, unspecified", category: "Personality" },

  // Neurodevelopmental / Cognitive
  { code: "F84.0", description: "Autism spectrum disorder", category: "Neurodev" },
  { code: "F90.0", description: "ADHD, predominantly inattentive type", category: "Neurodev" },
  { code: "F90.1", description: "ADHD, predominantly hyperactive type", category: "Neurodev" },
  { code: "F90.2", description: "ADHD, combined type", category: "Neurodev" },
  { code: "F90.9", description: "ADHD, unspecified", category: "Neurodev" },
  { code: "F70", description: "Mild intellectual disabilities", category: "Neurodev" },
  { code: "F71", description: "Moderate intellectual disabilities", category: "Neurodev" },

  // Self-harm / Suicidality (Z codes)
  { code: "R45.851", description: "Suicidal ideation", category: "Safety" },
  { code: "T14.91", description: "Suicide attempt", category: "Safety" },
  { code: "Z91.5", description: "Personal history of self-harm", category: "Safety" },
  { code: "Z63.4", description: "Disappearance / death of family member", category: "Safety" },

  // Other relevant
  { code: "F51.01", description: "Primary insomnia", category: "Sleep" },
  { code: "F51.02", description: "Adjustment insomnia", category: "Sleep" },
  { code: "G47.00", description: "Insomnia, unspecified", category: "Sleep" },
];

export function searchIcd10(query: string, limit = 8): Icd10Code[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ICD10_BH.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
  ).slice(0, limit);
}
