// ============ Code.gs ============
const DRIVE_FOLDER_NAME = "Claims Dashboards";
const MAX_FILE_SIZE_MB = 10;
const CLIENT_MAPPING_SHEET_NAME = "Client_Mapping";
const MASTER_DICTIONARY_SHEET_NAME = "ICD_Master_Dictionary";
const MEETING_REQUESTS_MASTER_SHEET_NAME = "Meeting_Requests";

// ============ ORGAN SYSTEMS (12) ============
// Wellness hub shows the top 5 by paid amount, per client.
const ORGAN_SYSTEMS = [
  { key: "Eyes",            label: "Eyes",                    icon: "fas fa-eye" },
  { key: "Ears",            label: "Ears / ENT",              icon: "fas fa-ear-listen" },
  { key: "Respiratory",     label: "Respiratory",             icon: "fas fa-lungs" },
  { key: "Digestive",       label: "Digestive",               icon: "fas fa-utensils" },
  { key: "Endocrine",       label: "Endocrine & Metabolic",   icon: "fas fa-droplet" },
  { key: "Skin",            label: "Skin",                    icon: "fas fa-hand-dots" },
  { key: "Musculoskeletal", label: "Musculoskeletal",         icon: "fas fa-bone" },
  { key: "Cardiovascular",  label: "Cardiovascular",          icon: "fas fa-heart-pulse" },
  { key: "Neurological",    label: "Neurological",            icon: "fas fa-brain" },
  { key: "Blood",           label: "Blood",                   icon: "fas fa-droplet" },
  { key: "Maternity",       label: "Maternity",               icon: "fas fa-baby-carriage" },
  { key: "Oncology",        label: "Oncology",                icon: "fas fa-ribbon" },
  { key: "Other",           label: "Other / General",         icon: "fas fa-leaf" }
];

const ORGAN_SYSTEM_KEYS = ORGAN_SYSTEMS.map(o => o.key);
const ORGAN_SYSTEM_MAP = {};
ORGAN_SYSTEMS.forEach(o => { ORGAN_SYSTEM_MAP[o.key] = o; });

// ============ ICD DICTIONARY (Base — 45 entries) ============
// Each entry carries: prevent, manage, bucket (legacy), organSystem (new)
const ICD_DICTIONARY = {
  "Diseases of the eye and adnexa": {
    prevent: "Annual vision screening, screen-time breaks, protective eyewear, diabetic retinopathy checks.",
    manage: "Ophthalmology consultation, prescribed corrective lenses, medication adherence, regular follow-ups.",
    bucket: "Vision", organSystem: "Eyes"
  },
  "CATARACT": {
    prevent: "Regular eye checkups, UV-protective sunglasses, blood sugar control, avoid smoking.",
    manage: "Ophthalmology assessment, surgical evaluation, post-operative care, follow-up reviews.",
    bucket: "Vision", organSystem: "Eyes"
  },
  "OTHER EYE DISORDERS": {
    prevent: "Routine eye exams, screen hygiene, protective eyewear at work, controlled screen time.",
    manage: "Ophthalmology consultation, prescribed medication, corrective measures, follow-up care.",
    bucket: "Vision", organSystem: "Eyes"
  },
  "Diseases of the ear and mastoid process": {
    prevent: "Hearing protection in noisy environments, safe listening practices, annual audiometry.",
    manage: "ENT consultation, hearing aids if needed, infection management, follow-up audiometry.",
    bucket: "Hearing", organSystem: "Ears"
  },
  "DISORDERS OF THE EAR": {
    prevent: "Protective earplugs, limited headphone volume, regular ear hygiene, avoid water retention.",
    manage: "ENT specialist review, medication for infections, hearing rehabilitation, monitoring.",
    bucket: "Hearing", organSystem: "Ears"
  },
  "Diseases of the respiratory system": {
    prevent: "Avoid smoking, maintain air quality, annual lung function tests, flu and pneumonia vaccines.",
    manage: "Pulmonology consultation, inhaler therapy adherence, breathing exercises, regular monitoring.",
    bucket: "Respiratory", organSystem: "Respiratory"
  },
  "DISORDERS OF THE RESPIRATORY SYSTEM": {
    prevent: "Smoking cessation, workplace ventilation, dust/fume protection, seasonal vaccinations.",
    manage: "Respiratory specialist review, bronchodilator therapy, physiotherapy, pulmonary rehabilitation.",
    bucket: "Respiratory", organSystem: "Respiratory"
  },
  "Diseases of the digestive system": {
    prevent: "Balanced diet, adequate hydration, regular meals, limited processed foods, stress management.",
    manage: "Gastroenterology consultation, dietary modification, medication, endoscopy if indicated.",
    bucket: "Digestive & Metabolic", organSystem: "Digestive"
  },
  "DISORDERS OF THE GASTROINTESTINAL SYSTEM": {
    prevent: "High-fiber diet, hydration, regular physical activity, avoid trigger foods, smaller meals.",
    manage: "Gastroenterology review, antacids/probiotics as prescribed, dietary adjustments, follow-up endoscopy.",
    bucket: "Digestive & Metabolic", organSystem: "Digestive"
  },
  "DISORDERS OF THE KIDNEY": {
    prevent: "Adequate hydration, controlled blood pressure, low-sodium diet, avoid NSAID overuse.",
    manage: "Nephrology consultation, renal function monitoring, diet management, medication adherence.",
    bucket: "Digestive & Metabolic", organSystem: "Digestive"
  },
  "DISORDERS OF THE GENITOURINARY SYSTEM": {
    prevent: "Hydration, hygiene, regular checkups, safe practices, timely treatment of infections.",
    manage: "Urology or gynecology consultation, antibiotics if indicated, follow-up imaging, dietary support.",
    bucket: "Digestive & Metabolic", organSystem: "Digestive"
  },
  "Diseases of the genitourinary system": {
    prevent: "Hydration, hygiene, routine screening, early management of urinary symptoms.",
    manage: "Specialist consultation, appropriate antibiotics or therapy, follow-up evaluation.",
    bucket: "Digestive & Metabolic", organSystem: "Digestive"
  },
  "DIABETES MELLITUS": {
    prevent: "Balanced diet, regular exercise, weight management, annual HbA1c screening.",
    manage: "Glucose monitoring, medication adherence, diabetic diet, retinopathy and nephropathy screening.",
    bucket: "Digestive & Metabolic", organSystem: "Endocrine"
  },
  "NUTRITIONAL & METABOLIC DISORDERS": {
    prevent: "Balanced nutrition, regular physical activity, weight monitoring, annual metabolic panel.",
    manage: "Dietitian consultation, supplementation as advised, lifestyle modification, periodic labs.",
    bucket: "Digestive & Metabolic", organSystem: "Endocrine"
  },
  "ENDOCRINE DISORDERS": {
    prevent: "Regular hormone screening, weight management, balanced diet, stress control.",
    manage: "Endocrinology consultation, hormone therapy adherence, periodic monitoring, lifestyle support.",
    bucket: "Digestive & Metabolic", organSystem: "Endocrine"
  },
  "Endocrine, nutritional and metabolic diseases": {
    prevent: "Healthy diet, regular exercise, annual screening, weight and stress management.",
    manage: "Endocrinology review, prescribed therapy, dietary management, periodic follow-up.",
    bucket: "Digestive & Metabolic", organSystem: "Endocrine"
  },
  "Diseases of the skin and subcutaneous tissue": {
    prevent: "Skin hygiene, moisturizers, sun protection, avoid harsh chemicals, hydration.",
    manage: "Dermatology consultation, topical or systemic therapy, trigger avoidance, follow-up.",
    bucket: "Dermatology", organSystem: "Skin"
  },
  "SKIN DISORDERS": {
    prevent: "Daily skincare routine, hydration, sun protection, avoid allergens and irritants.",
    manage: "Dermatology review, prescribed creams or medication, allergen testing, ongoing care.",
    bucket: "Dermatology", organSystem: "Skin"
  },
  "Diseases of the musculoskeletal system and connective tissue": {
    prevent: "Ergonomic training, posture workshops, daily stretch breaks, workstation audits, weight management.",
    manage: "Physiotherapy, pain management plan, orthopedic consultation, phased return-to-work.",
    bucket: "Other", organSystem: "Musculoskeletal"
  },
  "DISORDERS OF THE MUSCULOSKELTAL SYSTEM": {
    prevent: "Ergonomics, strength training, posture correction, stretching, load management.",
    manage: "Physiotherapy, orthopedic review, medication, activity modification.",
    bucket: "Other", organSystem: "Musculoskeletal"
  },
  "Fractures,Musculoskeletal & Connective Tissue Diseases": {
    prevent: "Fall prevention, calcium and vitamin D, strength training, workplace safety.",
    manage: "Orthopedic consultation, immobilization, physiotherapy, phased rehabilitation.",
    bucket: "Other", organSystem: "Musculoskeletal"
  },
  "INJURIES / FRACTURES / DISLOCATIONS": {
    prevent: "Workplace safety, protective gear, fall prevention, road safety, strength training.",
    manage: "Immediate first aid, orthopedic assessment, immobilization, physiotherapy and rehab.",
    bucket: "Other", organSystem: "Musculoskeletal"
  },
  "Diseases of the circulatory system": {
    prevent: "BP and cholesterol control, low-sodium diet, regular exercise, smoking cessation.",
    manage: "Cardiology consultation, medication adherence, lifestyle modification, periodic cardiac evaluation.",
    bucket: "Other", organSystem: "Cardiovascular"
  },
  "CARDIAC DISORDERS": {
    prevent: "Heart-healthy diet, regular exercise, stress management, annual cardiac screening.",
    manage: "Cardiology review, prescribed therapy, cardiac rehabilitation, follow-up testing.",
    bucket: "Other", organSystem: "Cardiovascular"
  },
  "HYPERTENSIVE DISORDERS": {
    prevent: "Low-sodium diet, regular exercise, weight control, stress management, BP monitoring.",
    manage: "Antihypertensive therapy, home BP monitoring, dietary management, cardiology follow-up.",
    bucket: "Other", organSystem: "Cardiovascular"
  },
  "DISORDERS OF BLOOD VESSELS": {
    prevent: "Cholesterol control, exercise, no smoking, healthy weight, regular vascular screening.",
    manage: "Vascular specialist review, medication, lifestyle changes, periodic imaging.",
    bucket: "Other", organSystem: "Cardiovascular"
  },
  "Circulatory": {
    prevent: "Heart-healthy lifestyle, exercise, low-fat diet, regular BP and lipid screening.",
    manage: "Cardiology consultation, prescribed medications, lifestyle modification, follow-up.",
    bucket: "Other", organSystem: "Cardiovascular"
  },
  "Diseases of the nervous system": {
    prevent: "Stress management, adequate sleep, head injury prevention, regular checkups.",
    manage: "Neurology consultation, medication adherence, physiotherapy, cognitive rehabilitation.",
    bucket: "Other", organSystem: "Neurological"
  },
  "NEUROLOGICAL & CEREBROVASCULAR DISORDERS": {
    prevent: "BP and glucose control, avoid smoking, regular exercise, stress and sleep hygiene.",
    manage: "Neurology review, prescribed therapy, physiotherapy, follow-up imaging.",
    bucket: "Other", organSystem: "Neurological"
  },
  "Diseases of the blood and blood-forming organs and certain disorders involving the immune mechanism": {
    prevent: "Balanced diet rich in iron and vitamins, regular blood work, infection prevention.",
    manage: "Hematology consultation, supplementation, medication, periodic monitoring.",
    bucket: "Other", organSystem: "Blood"
  },
  "DISORDERS OF BLOOD & BLOOD FORMING ORGANS, IMMUNE MECHANISM": {
    prevent: "Iron-rich diet, vitamin supplementation, screening, infection prevention.",
    manage: "Hematology review, prescribed treatment, dietary support, follow-up testing.",
    bucket: "Other", organSystem: "Blood"
  },
  "Certain infectious and parasitic diseases": {
    prevent: "Hand hygiene, vaccinations, safe food and water, vector control, early treatment.",
    manage: "Appropriate anti-infective therapy, isolation if needed, supportive care, follow-up.",
    bucket: "Other", organSystem: "Other"
  },
  "INFECTIOUS DISEASES (BACTERIAL / VIRAL / Others)": {
    prevent: "Vaccination, hygiene, safe food and water, early symptom reporting.",
    manage: "Targeted anti-infective therapy, supportive care, rest, medical follow-up.",
    bucket: "Other", organSystem: "Other"
  },
  "Pregnancy, childbirth and the puerperium": {
    prevent: "Pre-conception counseling, folic acid, regular antenatal checkups, balanced diet.",
    manage: "Antenatal care, hospital delivery plan, postnatal care, lactation and nutrition support.",
    bucket: "Other", organSystem: "Maternity"
  },
  "MATERNITY RELATED DISORDERS": {
    prevent: "Preconception care, regular antenatal visits, balanced diet, appropriate exercise.",
    manage: "Obstetric consultation, timely interventions, postpartum care, follow-up reviews.",
    bucket: "Other", organSystem: "Maternity"
  },
  "Normal Delivery": {
    prevent: "Regular antenatal care, balanced nutrition, moderate exercise, birth preparedness.",
    manage: "Hospital delivery, postpartum care, lactation support, follow-up reviews.",
    bucket: "Other", organSystem: "Maternity"
  },
  "Cesarean": {
    prevent: "Regular antenatal care, gestational diabetes and BP control, planned delivery.",
    manage: "Post-operative care plan, wound care, physiotherapy, lactation support, follow-up reviews.",
    bucket: "Other", organSystem: "Maternity"
  },
  "CAESAREAN SECTION": {
    prevent: "Antenatal care, gestational diabetes management, planning with obstetrician.",
    manage: "Post-op care, wound management, physiotherapy, lactation support, follow-up.",
    bucket: "Other", organSystem: "Maternity"
  },
  "Certain conditions originating in the perinatal period": {
    prevent: "Antenatal care, maternal nutrition, timely delivery, newborn screening.",
    manage: "Neonatal ICU care, pediatric consultation, monitoring, developmental follow-up.",
    bucket: "Other", organSystem: "Maternity"
  },
  "NEONATAL DISORDERS": {
    prevent: "Antenatal care, safe delivery, newborn screening, maternal nutrition.",
    manage: "Neonatal specialist care, monitoring, parental counseling, follow-up.",
    bucket: "Other", organSystem: "Maternity"
  },
  "Perinatal/Newborn Diseases": {
    prevent: "Antenatal care, timely delivery, newborn screening, immunization.",
    manage: "Neonatal care, pediatric monitoring, follow-up developmental assessment.",
    bucket: "Other", organSystem: "Maternity"
  },
  "Congenital malformations, deformations and chromosomal abnormalities": {
    prevent: "Preconception counseling, avoid teratogens, genetic screening if indicated, antenatal care.",
    manage: "Pediatric specialist review, corrective interventions, therapy, long-term follow-up.",
    bucket: "Other", organSystem: "Maternity"
  },
  "CONGENITAL DISORDERS": {
    prevent: "Preconception counseling, genetic screening, avoidance of teratogens, antenatal monitoring.",
    manage: "Specialist pediatric care, corrective procedures, therapy, ongoing follow-up.",
    bucket: "Other", organSystem: "Maternity"
  },
  "Congenital Malformations": {
    prevent: "Preconception counseling, genetic screening, antenatal care.",
    manage: "Specialist review, corrective intervention, therapy, follow-up.",
    bucket: "Other", organSystem: "Maternity"
  },
  "Neoplasms": {
    prevent: "Avoid tobacco and alcohol, healthy diet, regular screening, HPV and hepatitis vaccination.",
    manage: "Oncology consultation, staging, treatment plan, supportive care, follow-up.",
    bucket: "Other", organSystem: "Oncology"
  },
  "CANCER": {
    prevent: "Tobacco cessation, healthy lifestyle, regular screening, HPV/hepatitis vaccination.",
    manage: "Oncology team review, treatment planning, supportive care, regular follow-up.",
    bucket: "Other", organSystem: "Oncology"
  },
  "Mental and behavioural disorders": {
    prevent: "Stress management, sleep hygiene, social support, mindfulness, early help-seeking.",
    manage: "Psychiatry or psychology consultation, therapy, medication if indicated, follow-up.",
    bucket: "Other", organSystem: "Other"
  },
  "Symptoms, signs and abnormal clinical and laboratory findings, not elsewhere classified": {
    prevent: "Regular health checkups, prompt symptom review, lifestyle hygiene.",
    manage: "Clinical evaluation, targeted tests, specialist review, follow-up.",
    bucket: "Other", organSystem: "Other"
  },
  "Symptoms, signs and abnormal clinical and laboratory findings": {
    prevent: "Routine health screening, healthy lifestyle, prompt symptom review.",
    manage: "Clinical assessment, diagnostic workup, specialist input, follow-up.",
    bucket: "Other", organSystem: "Other"
  },
  "Symptoms not elsewhere classified": {
    prevent: "Routine checkups, symptom awareness, healthy habits.",
    manage: "Clinical evaluation, targeted diagnostics, follow-up care.",
    bucket: "Other", organSystem: "Other"
  },
  "External causes of morbidity and mortality": {
    prevent: "Workplace safety, road safety, fall prevention, protective equipment.",
    manage: "Emergency care, injury management, rehabilitation, follow-up.",
    bucket: "Other", organSystem: "Other"
  },
  "Factors influencing health status and contact with health services": {
    prevent: "Routine health checks, adherence to scheduled screenings.",
    manage: "Follow-up consultations, screening completion, preventive care.",
    bucket: "Other", organSystem: "Other"
  },
  "Factors influencing health status": {
    prevent: "Regular health checkups, screenings, lifestyle management.",
    manage: "Preventive consultations, health monitoring, follow-up.",
    bucket: "Other", organSystem: "Other"
  },
  "GYNECOLOGICAL DISORDERS": {
    prevent: "Regular gynecological checkups, hygiene, screening, balanced lifestyle.",
    manage: "Gynecology consultation, medication, procedures if indicated, follow-up.",
    bucket: "Other", organSystem: "Maternity"
  },
  "Not coded": {
    prevent: "General wellness guidance — consult your health team for tailored recommendations.",
    manage: "Consult your healthcare provider for appropriate management of this condition.",
    bucket: "Other", organSystem: "Other"
  },
  "NA": {
    prevent: "General wellness guidance — consult your health team for tailored recommendations.",
    manage: "Consult your healthcare provider for appropriate management of this condition.",
    bucket: "Other", organSystem: "Other"
  },
  "Others": {
    prevent: "General wellness guidance — consult your health team for tailored recommendations.",
    manage: "Consult your healthcare provider for appropriate management of this condition.",
    bucket: "Other", organSystem: "Other"
  }
};

// ============ KEYWORD → ORGAN SYSTEM FALLBACK ============
const ICD_KEYWORD_BUCKETS = [
  { organSystem: "Eyes",           keywords: ["eye", "ophthal", "vision", "cataract", "retina", "glaucoma", "conjunctiv", "cornea", "myopia", "hypermetropia", "optometry", "blind"] },
  { organSystem: "Ears",           keywords: ["ear", "hearing", "audio", "oto", "tinnitus", "vertigo", "deaf", "audiometry", "otitis", "mastoid", "nasal", "sinus", "rhinitis", "ent", "throat"] },
  { organSystem: "Respiratory",    keywords: ["resp", "lung", "asthma", "bronc", "pulmonary", "copd", "influenza", "pneumonia", "breath"] },
  { organSystem: "Digestive",      keywords: ["digest", "gastro", "stomach", "liver", "hepat", "kidney", "renal", "urinary", "genitour", "gyn", "intestin", "colon"] },
  { organSystem: "Endocrine",      keywords: ["nutri", "metab", "diabet", "endocrine", "thyroid", "obesity", "hormone"] },
  { organSystem: "Skin",           keywords: ["skin", "dermat", "rash", "eczema", "psoria", "acne", "fungal", "allergy", "urticaria", "hair", "nail"] },
  { organSystem: "Musculoskeletal",keywords: ["musculo", "skelet", "fracture", "dislocat", "bone", "joint", "arthr", "sprain", "posture"] },
  { organSystem: "Cardiovascular", keywords: ["cardiac", "cardio", "heart", "hyperten", "circulat", "vascular", "cholesterol", "bp "] },
  { organSystem: "Neurological",   keywords: ["neuro", "cerebro", "brain", "nerve", "seizure", "epilep", "migraine", "stroke"] },
  { organSystem: "Blood",          keywords: ["blood", "anem", "hemat", "haemat", "immune", "platelet", "hemoglobin"] },
  { organSystem: "Maternity",      keywords: ["pregnan", "matern", "delivery", "cesar", "caesar", "puerper", "perinatal", "neonatal", "congenital", "childbirth"] },
  { organSystem: "Oncology",       keywords: ["neoplasm", "cancer", "tumor", "tumour", "malign", "oncolog"] }
];

// ============ MAIN FUNCTIONS ============

function doGet(e) {
  const params = e.parameter || {};
  const clientId = params.clientId;
  const mode = params.mode;
  const id = params.id;

  if (clientId) {
    return handleGoogleSheetDashboard(clientId);
  } else if (mode === 'upload') {
    return handleUploadPage();
  } else if (id && mode === 'api') {
    return getDashboardDataApi(id);
  } else if (id) {
    return handleDashboardView(id);
  } else {
    return handleHomePage();
  }
}

function doPost(e) {
  let mode = '';
  let clientId = '';

  if (e.parameter && e.parameter.mode) {
    mode = e.parameter.mode;
    clientId = e.parameter.clientId || '';
  } else if (e.postData && e.postData.contents) {
    try {
      const data = JSON.parse(e.postData.contents);
      mode = data.mode || '';
      clientId = data.clientId || '';
    } catch (error) {
      console.log('JSON parse error:', error);
    }
  }

  if (mode === 'upload') {
    return handleFileUpload(e, clientId);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: 'Invalid request' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============ UPLOAD FUNCTION ============

function uploadFile(data) {
  console.log('=== uploadFile function called ===');

  try {
    const clientIdInput = data.clientId || '';
    const clientName = data.clientName || '';
    const fileName = data.fileName || '';
    const fileContent = data.fileContent || '';
    const hasClaims = (data.hasClaims === undefined || data.hasClaims === null) ? true : !!data.hasClaims;
    const generationDate = data.generationDate || '';
    const ageDataAvailable = !!data.ageDataAvailable;

    const policies = data.policies || null;

    console.log('Client ID:', clientIdInput);
    console.log('Client Name:', clientName);
    console.log('Has Claims:', hasClaims);
    console.log('Age Data Available:', ageDataAvailable);
    console.log('Policies count:', policies ? policies.length : 0);

    if (!policies || !Array.isArray(policies) || policies.length === 0) {
      throw new Error('At least one policy is required');
    }

    let parsedData = { data: [], columnMapping: {} };

    if (hasClaims) {
      if (!fileContent || fileContent.length === 0) {
        throw new Error('No file content received');
      }

      const fileSizeMB = (fileContent.length * 3) / (4 * 1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        throw new Error(`File too large (${fileSizeMB.toFixed(1)}MB). Maximum: ${MAX_FILE_SIZE_MB}MB`);
      }

      parsedData = parseExcelFile(fileContent, fileName);
      console.log('Excel parsed:', parsedData.data.length, 'rows');

      if (parsedData.data.length === 0) {
        throw new Error('No valid data found in Excel file');
      }
    }

    const processedPolicies = policies.map(p => ({
      policyNumber: String(p.policyNumber || '').trim(),
      policyType: String(p.policyType || 'ESC').trim(),
      premium: parseFloat(p.premium) || 0,
      earnedPremium: parseFloat(p.earnedPremium) || 0,
      lives: parseInt(p.lives) || 0,
      startDate: String(p.startDate || '').trim(),
      endDate: String(p.endDate || '').trim(),
      visibility: 'Active',
      period: String(p.period || '').toLowerCase() === 'previous' ? 'Previous' : 'Current',
      walletBrackets: Array.isArray(p.walletBrackets) ? p.walletBrackets.map(wb => ({
        sumInsured: parseFloat(wb.sumInsured) || 0,
        lives: parseInt(wb.lives) || 0
      })).filter(wb => wb.sumInsured > 0 && wb.lives > 0) : [],
      livesDistribution: p.livesDistribution && typeof p.livesDistribution === 'object' ? {
        self: parseInt(p.livesDistribution.self) || 0,
        spouse: parseInt(p.livesDistribution.spouse) || 0,
        son: parseInt(p.livesDistribution.son) || 0,
        daughter: parseInt(p.livesDistribution.daughter) || 0,
        father: parseInt(p.livesDistribution.father) || 0,
        mother: parseInt(p.livesDistribution.mother) || 0,
        fatherInLaw: parseInt(p.livesDistribution.fatherInLaw) || 0,
        motherInLaw: parseInt(p.livesDistribution.motherInLaw) || 0,
        others: parseInt(p.livesDistribution.others) || 0
      } : null
    }));

    // ---- Previous policy period checks ----
    const previousPolicies = processedPolicies.filter(p => p.period === 'Previous');
    if (previousPolicies.length > 0) {
      if (!processedPolicies.some(p => p.period === 'Current')) {
        throw new Error('Please add at least one current policy along with the previous policy.');
      }
      if (hasClaims && !parsedData.columnMapping['policyNumber']) {
        throw new Error('To show previous policy data, the Excel needs a "Policy Number" column so each claim can be matched to the right policy period.');
      }
      const seenNumbers = {};
      processedPolicies.forEach(p => {
        if (seenNumbers[p.policyNumber]) {
          throw new Error('Policy number "' + p.policyNumber + '" is used more than once. Each current and previous policy needs its own Policy Number.');
        }
        seenNumbers[p.policyNumber] = true;
      });
    }

    let finalClientId = clientIdInput;
    if (!finalClientId) {
      finalClientId = 'client_' + Utilities.getUuid().substring(0, 8);
      console.log('Generated new client ID:', finalClientId);
    }

    const newSheetName = clientName && clientName.trim() !== ''
      ? clientName.trim() + '_Dashboard'
      : 'Dashboard_' + finalClientId;

    let isNewClient = false;
    let existingSheetId = clientIdInput ? getClientSheetId(clientIdInput) : null;

    if (!existingSheetId) {
      const folder = getDashboardFolder();
      const sameName = folder.getFilesByName(newSheetName);
      if (sameName.hasNext()) {
        const foundFile = sameName.next();
        if (foundFile.getMimeType() === MimeType.GOOGLE_SHEETS) {
          const ss = SpreadsheetApp.openById(foundFile.getId());
          const configSheet = ss.getSheetByName('Config');
          if (configSheet) {
            const configData = configSheet.getDataRange().getValues();
            for (let i = 1; i < configData.length; i++) {
              if (String(configData[i][0]).toLowerCase().trim() === 'client id') {
                const sheetClientId = String(configData[i][1] || '').trim();
                if (sheetClientId && sheetClientId !== finalClientId) {
                  throw new Error(
                    'A dashboard named "' + newSheetName + '" already exists with Client ID "' + sheetClientId + '". ' +
                    'If you intend to update that client, use the same Client ID. ' +
                    'If this is a new client, please use a different Client Name.'
                  );
                }
                existingSheetId = foundFile.getId();
                finalClientId = sheetClientId;
                break;
              }
            }
          }
        }
      }
    }

    const webappUrl = ScriptApp.getService().getUrl();
    const shareUrl = `${webappUrl}?clientId=${finalClientId}`;

    let uniqueICDs = [];
    if (hasClaims && parsedData.data.length > 0) {
      uniqueICDs = extractUniqueICDs(parsedData.data, parsedData.columnMapping);
    }

    let unknownPolicies = [];
    if (hasClaims && parsedData.data.length > 0) {
      const activePolicyNumbers = new Set(processedPolicies.map(p => p.policyNumber));
      const policyCol = parsedData.columnMapping['policyNumber'];
      if (policyCol) {
        const unknownSet = new Set();
        parsedData.data.forEach(row => {
          const pn = String(row[policyCol] || '').trim();
          if (pn && !activePolicyNumbers.has(pn)) unknownSet.add(pn);
        });
        unknownPolicies = [...unknownSet];
      }
    }

    let totalPremium = 0, totalEarned = 0;
    processedPolicies.forEach(p => {
      if (p.period === 'Previous') return;
      totalPremium += p.premium;
      totalEarned += p.earnedPremium;
    });

    const dashboardData = {
      data: parsedData.data,
      columnMapping: parsedData.columnMapping,
      hasClaims: hasClaims,
      premium: totalPremium,
      earnedPremium: totalEarned,
      generationDate: generationDate,
      memberData: null,
      fileName: fileName,
      clientName: clientName,
      shareUrl: shareUrl,
      clientId: finalClientId,
      uniqueICDs: uniqueICDs,
      policies: processedPolicies,
      ageDataAvailable: ageDataAvailable,
      unknownPolicies: unknownPolicies
    };

    let sheetId;
    if (existingSheetId) {
      sheetId = updateClientGoogleSheet(finalClientId, dashboardData);
      console.log('Updated existing Google Sheet:', sheetId);
    } else {
      sheetId = createClientGoogleSheet(finalClientId, dashboardData);
      isNewClient = true;
      console.log('Created new Google Sheet for client ID:', finalClientId);
    }

    let newICDsDetected = [];
    if (hasClaims && uniqueICDs.length > 0) {
      newICDsDetected = detectNewICDs(uniqueICDs);
    }

    const response = {
      success: true,
      clientId: finalClientId,
      clientName: clientName || finalClientId,
      shareUrl: shareUrl,
      sheetId: sheetId,
      isNewClient: isNewClient,
      hasClaims: hasClaims,
      message: isNewClient ? 'New dashboard created successfully!' : 'Dashboard updated successfully!',
      isPermanent: true,
      newICDsDetected: newICDsDetected,
      unknownPolicies: unknownPolicies,
      stats: {
        records: parsedData.data.length,
        premium: totalPremium,
        earnedPremium: totalEarned,
        generationDate: generationDate,
        hasMemberData: false,
        uniqueICDCount: uniqueICDs.length,
        newICDCount: newICDsDetected.length,
        policyCount: processedPolicies.length,
        previousPolicyCount: previousPolicies.length,
        unknownPolicyCount: unknownPolicies.length,
        ageDataAvailable: ageDataAvailable
      }
    };

    console.log('Upload successful. Client ID:', finalClientId, 'Sheet ID:', sheetId);
    return response;

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.toString(),
      message: `Upload failed: ${error.message}`
    };
  }
}

// ============ EXTRACT UNIQUE ICDs ============

function extractUniqueICDs(claimsData, columnMapping) {
  const icdField = columnMapping['disease'];
  if (!icdField) return [];
  const set = new Set();
  claimsData.forEach(row => {
    const val = row[icdField];
    if (val !== null && val !== undefined && String(val).trim() !== '') {
      set.add(String(val).trim());
    }
  });
  return [...set];
}

// ============ LOOKUP ICD ============

function lookupICD(icd) {
  const key = String(icd).trim();
  const lowerKey = key.toLowerCase();

  try {
    const masterSheet = getMasterDictionarySheet();
    const dataSheet = masterSheet.getSheetByName('Dictionary');
    if (dataSheet) {
      const data = dataSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim().toLowerCase() === lowerKey) {
          // Column layout: ICD | Prevent | Manage | Bucket | Source | Flagged | OrganSystem
          const orgFromSheet = String(data[i][6] || '').trim();
          return {
            prevent: String(data[i][1] || ''),
            manage: String(data[i][2] || ''),
            bucket: String(data[i][3] || 'Other'),
            organSystem: orgFromSheet || classifyICDToOrganSystem(key),
            source: String(data[i][4] || 'Sheet')
          };
        }
      }
    }
  } catch (e) {
    console.log('Master sheet lookup error:', e);
  }

  for (const dictKey of Object.keys(ICD_DICTIONARY)) {
    if (dictKey.toLowerCase() === lowerKey) {
      const entry = ICD_DICTIONARY[dictKey];
      return {
        prevent: entry.prevent,
        manage: entry.manage,
        bucket: entry.bucket,
        organSystem: entry.organSystem || classifyICDToOrganSystem(key),
        source: 'Base'
      };
    }
  }

  return {
    prevent: 'General wellness guidance — consult your health team for tailored recommendations.',
    manage: 'Consult your healthcare provider for appropriate management of this condition.',
    bucket: 'Other',
    organSystem: classifyICDToOrganSystem(key),
    source: 'Fallback'
  };
}

function classifyICDToOrganSystem(icd) {
  const lower = String(icd).toLowerCase();
  for (const entry of ICD_KEYWORD_BUCKETS) {
    for (const kw of entry.keywords) {
      if (lower.indexOf(kw) !== -1) return entry.organSystem;
    }
  }
  return 'Other';
}

// Backward-compat alias — some callers may still reference the old name
function classifyICDToBucket(icd) {
  return classifyICDToOrganSystem(icd);
}

// ============ DETECT NEW ICDs ============

function detectNewICDs(uniqueICDs) {
  const newOnes = [];
  let masterKeys = new Set();

  try {
    const masterSheet = getMasterDictionarySheet();
    const dataSheet = masterSheet.getSheetByName('Dictionary');
    if (dataSheet) {
      const data = dataSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0]) masterKeys.add(String(data[i][0]).trim().toLowerCase());
      }
    }
  } catch (e) {
    console.log('detectNewICDs master read error:', e);
  }

  const baseKeys = new Set(Object.keys(ICD_DICTIONARY).map(k => k.toLowerCase()));

  uniqueICDs.forEach(icd => {
    const key = String(icd).trim().toLowerCase();
    if (!masterKeys.has(key) && !baseKeys.has(key)) newOnes.push(icd);
  });

  if (newOnes.length > 0) {
    try {
      const masterSheet = getMasterDictionarySheet();
      const dataSheet = masterSheet.getSheetByName('Dictionary');
      const rows = newOnes.map(icd => {
        const organSystem = classifyICDToOrganSystem(icd);
        // Column layout: ICD | Prevent | Manage | Bucket | Source | Flagged | OrganSystem
        return [
          icd,
          'General wellness guidance — consult your health team for tailored recommendations.',
          'Consult your healthcare provider for appropriate management of this condition.',
          'Other',
          'Auto',
          'NEW',
          organSystem
        ];
      });
      dataSheet.getRange(dataSheet.getLastRow() + 1, 1, rows.length, 7).setValues(rows);
    } catch (e) {
      console.log('Failed to append new ICDs:', e);
    }
  }

  return newOnes;
}

// ============ MASTER DICTIONARY SHEET ============

function getMasterDictionarySheet() {
  const folder = getDashboardFolder();
  const files = folder.getFilesByName(MASTER_DICTIONARY_SHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.openById(files.next().getId());

  const sheet = SpreadsheetApp.create(MASTER_DICTIONARY_SHEET_NAME);
  const file = DriveApp.getFileById(sheet.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  const dataSheet = sheet.getActiveSheet();
  dataSheet.setName('Dictionary');
  // Column layout: ICD | Prevent | Manage | Bucket | Source | Flagged | OrganSystem
  dataSheet.appendRow(['ICD', 'How to Prevent', 'How to Manage', 'Bucket', 'Source', 'Flagged', 'Organ System']);

  const rows = Object.keys(ICD_DICTIONARY).map(icd => {
    const e = ICD_DICTIONARY[icd];
    return [icd, e.prevent, e.manage, e.bucket, 'Base', '', e.organSystem || 'Other'];
  });
  if (rows.length > 0) {
    dataSheet.getRange(2, 1, rows.length, 7).setValues(rows);
    dataSheet.setFrozenRows(1);
  }
  return sheet;
}

// ============ WELLNESS CALENDAR ============

function getDefaultWellnessCalendar() {
  return [
    ['1', 'New Year Health Reset', 'Kick off the year with preventive screenings and healthy habit kickstarts.', 'Full-body health checkup camp', 'Nutrition counseling sessions', 'Fitness assessment', 'Mental wellness intro workshop'],
    ['2', 'Heart Health Month', 'Focus on cardiovascular wellness — BP, cholesterol, and lifestyle.', 'BP and lipid screening camp', 'Cardio fitness workshop', 'Heart-healthy cooking demo', 'Stress management session'],
    ['3', 'Respiratory Wellness', 'Address respiratory issues before seasonal changes.', 'Lung function screening', 'Smoking cessation support', 'Air quality awareness session', 'Breathing exercise workshop'],
    ['4', 'Diabetes Prevention Drive', 'Screen for pre-diabetes and build healthier sugar habits.', 'HbA1c and glucose screening', 'Diabetic diet workshop', 'Exercise challenge kickoff', 'Insulin awareness session'],
    ['5', 'Mental Health Awareness', 'Reduce stigma and support mental wellness.', 'Counseling camp', 'Mindfulness workshop', 'Sleep hygiene session', 'Stress management seminar'],
    ['6', 'Vision & Hearing Check', 'Screen and protect the senses that affect daily work.', 'Vision screening camp', 'Audiometry testing', 'Screen-time hygiene session', 'Protective eyewear distribution'],
    ['7', 'Musculoskeletal & Ergonomics', 'Prevent back pain and posture problems.', 'Posture assessment camp', 'Workstation audit drive', 'Physiotherapy consultations', 'Daily stretch challenge'],
    ['8', 'Skin & Dermatology Drive', 'Address common skin conditions and prevent dermatitis.', 'Skin screening camp', 'Dermatology consultations', 'Skincare hygiene workshop', 'Chemical safety training'],
    ['9', "Women's Wellness", 'Focus on gynaecological and hormonal health.', "Women's health screening", 'Gynaecology consultations', 'Nutritional counseling', 'Maternal wellness session'],
    ['10', 'Ergonomic Awareness Week', 'Prevent musculoskeletal injuries — our #1 cost driver.', 'Daily stretch sessions', 'Workstation audits', 'Posture workshops', 'Movement challenges'],
    ['11', 'Diabetes Awareness', 'Screen for pre-diabetes and build healthier sugar habits.', 'Sugar Screening', 'Diet Consultation', 'HbA1c & Fasting Glucose Camp', 'Step Challenge (30-min daily walk)'],
    ['12', 'Year-End Wellness Wrap', 'Reflect, screen, and prepare for the new year.', 'Comprehensive health camp', 'Yearly wellness report', 'Fitness challenge finale', 'Mental wellness review']
  ];
}

function getOrCreateWellnessCalendarSheet(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  let calSheet = ss.getSheetByName('Wellness Calendar');
  if (!calSheet) {
    calSheet = ss.insertSheet('Wellness Calendar');
    calSheet.appendRow(['Month', 'Program Name', 'Description', 'Highlight 1', 'Highlight 2', 'Highlight 3', 'Highlight 4']);
    const d = getDefaultWellnessCalendar();
    calSheet.getRange(2, 1, d.length, 7).setValues(d);
    calSheet.setFrozenRows(1);
  }
  return calSheet;
}

// ============ PREVENTION CONTENT ============
// Column layout: ICD | How to Prevent | How to Manage | Bucket | Source | OrganSystem

function generatePreventionContentForClient(sheetId, uniqueICDs) {
  const ss = SpreadsheetApp.openById(sheetId);
  let pcSheet = ss.getSheetByName('Prevention Content');
  if (!pcSheet) {
    pcSheet = ss.insertSheet('Prevention Content');
    pcSheet.appendRow(['ICD', 'How to Prevent', 'How to Manage', 'Bucket', 'Source', 'Organ System']);
    pcSheet.setFrozenRows(1);
  } else {
    const header = pcSheet.getRange(1, 1, 1, pcSheet.getLastColumn()).getValues()[0];
    if (header.length < 6 || String(header[5] || '').toLowerCase().indexOf('organ') === -1) {
      pcSheet.getRange(1, 6).setValue('Organ System');
    }
  }

  const existing = {};
  const data = pcSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim().toLowerCase();
    if (key) existing[key] = {
      row: i + 1,
      prevent: String(data[i][1] || ''),
      manage: String(data[i][2] || ''),
      bucket: String(data[i][3] || 'Other'),
      source: String(data[i][4] || 'Auto'),
      organSystem: String(data[i][5] || '')
    };
  }

  const toAppend = [];
  uniqueICDs.forEach(icd => {
    const key = String(icd).trim().toLowerCase();
    const lookup = lookupICD(icd);
    if (existing[key]) {
      if (existing[key].source === 'Manual') return;
      if (existing[key].prevent !== lookup.prevent || existing[key].manage !== lookup.manage ||
          existing[key].bucket !== lookup.bucket || existing[key].organSystem !== lookup.organSystem) {
        pcSheet.getRange(existing[key].row, 2).setValue(lookup.prevent);
        pcSheet.getRange(existing[key].row, 3).setValue(lookup.manage);
        pcSheet.getRange(existing[key].row, 4).setValue(lookup.bucket);
        pcSheet.getRange(existing[key].row, 5).setValue(lookup.source);
        pcSheet.getRange(existing[key].row, 6).setValue(lookup.organSystem);
      }
    } else {
      toAppend.push([icd, lookup.prevent, lookup.manage, lookup.bucket, lookup.source, lookup.organSystem]);
    }
  });

  if (toAppend.length > 0) {
    pcSheet.getRange(pcSheet.getLastRow() + 1, 1, toAppend.length, 6).setValues(toAppend);
  }
  return true;
}

function readPreventionContent(sheetId) {
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const pcSheet = ss.getSheetByName('Prevention Content');
    if (!pcSheet) return {};
    const data = pcSheet.getDataRange().getValues();
    const result = {};
    for (let i = 1; i < data.length; i++) {
      const key = String(data[i][0]).trim();
      if (key) result[key] = {
        prevent: String(data[i][1] || ''),
        manage: String(data[i][2] || ''),
        bucket: String(data[i][3] || 'Other'),
        source: String(data[i][4] || 'Auto'),
        organSystem: String(data[i][5] || 'Other')
      };
    }
    return result;
  } catch (e) { return {}; }
}

function readWellnessCalendar(sheetId) {
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const calSheet = ss.getSheetByName('Wellness Calendar');
    if (!calSheet) return [];
    const data = calSheet.getDataRange().getValues();
    const result = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === '' || data[i][0] === null) continue;
      result.push({
        month: String(data[i][0]),
        programName: String(data[i][1] || ''),
        description: String(data[i][2] || ''),
        highlights: [
          String(data[i][3] || ''),
          String(data[i][4] || ''),
          String(data[i][5] || ''),
          String(data[i][6] || '')
        ].filter(h => h !== '')
      });
    }
    return result;
  } catch (e) { return []; }
}

// ============ POLICIES TAB ============

function getOrCreatePoliciesSheet(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  let pSheet = ss.getSheetByName('Policies');
  if (!pSheet) {
    pSheet = ss.insertSheet('Policies');
    pSheet.appendRow(['Policy Number', 'Policy Type', 'Premium', 'Earned Premium', 'Lives', 'Start Date', 'End Date', 'Visibility', 'Period']);
    pSheet.setFrozenRows(1);
  }
  return pSheet;
}

function writePoliciesToSheet(sheetId, policies) {
  const pSheet = getOrCreatePoliciesSheet(sheetId);
  // Sheets created before the previous-policy feature only have 8 columns: add the Period column
  if (pSheet.getMaxColumns() < 9) pSheet.insertColumnsAfter(pSheet.getMaxColumns(), 9 - pSheet.getMaxColumns());
  if (String(pSheet.getRange(1, 9).getValue() || '').trim() === '') pSheet.getRange(1, 9).setValue('Period');
  const lastRow = pSheet.getLastRow();
  if (lastRow > 1) pSheet.deleteRows(2, lastRow - 1);

  if (policies && policies.length > 0) {
    const rows = policies.map(p => [
      p.policyNumber || '',
      p.policyType || '',
      p.premium || 0,
      p.earnedPremium || 0,
      p.lives || 0,
      p.startDate || '',
      p.endDate || '',
      p.visibility || 'Active',
      p.period === 'Previous' ? 'Previous' : 'Current'
    ]);
    pSheet.getRange(2, 1, rows.length, 9).setValues(rows);
  }
}

function readPolicies(sheetId) {
  const fallback = [{
    policyNumber: 'PRIMARY', policyType: 'ESC', premium: 0, earnedPremium: 0,
    lives: 0, startDate: '', endDate: '', visibility: 'Active', period: 'Current'
  }];
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const pSheet = ss.getSheetByName('Policies');
    if (!pSheet) return fallback;

    const data = pSheet.getDataRange().getValues();
    const result = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0] && !data[i][2]) continue;
      result.push({
        policyNumber: String(data[i][0] || ''),
        policyType: String(data[i][1] || ''),
        premium: parseFloat(data[i][2]) || 0,
        earnedPremium: parseFloat(data[i][3]) || 0,
        lives: parseInt(data[i][4]) || 0,
        startDate: String(data[i][5] || ''),
        endDate: String(data[i][6] || ''),
        visibility: String(data[i][7] || 'Active'),
        period: String(data[i][8] || '').toLowerCase() === 'previous' ? 'Previous' : 'Current'
      });
    }
    return result.length > 0 ? result : fallback;
  } catch (e) { return fallback; }
}

// ============ PER-POLICY MEMBER DATA (WALLET) ============

function getOrCreateMemberDataSheet(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  let mSheet = ss.getSheetByName('Member Data');
  if (!mSheet) {
    mSheet = ss.insertSheet('Member Data');
    mSheet.appendRow(['Policy Number', 'Wallet Amount (₹)', 'Number of Lives']);
    mSheet.setFrozenRows(1);
  } else {
    const header = mSheet.getRange(1, 1, 1, mSheet.getLastColumn()).getValues()[0];
    if (String(header[0] || '').toLowerCase().indexOf('policy') === -1) {
      mSheet.insertColumnBefore(1);
      mSheet.getRange(1, 1).setValue('Policy Number');
    }
  }
  return mSheet;
}

function writePerPolicyMemberData(sheetId, policies) {
  const mSheet = getOrCreateMemberDataSheet(sheetId);
  const lastRow = mSheet.getLastRow();
  if (lastRow > 1) mSheet.deleteRows(2, lastRow - 1);

  const rows = [];
  policies.forEach(p => {
    if (p.walletBrackets && p.walletBrackets.length > 0) {
      p.walletBrackets.forEach(wb => {
        rows.push([p.policyNumber, wb.sumInsured, wb.lives]);
      });
    }
  });

  if (rows.length > 0) {
    mSheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }
}

function readPerPolicyMemberData(sheetId) {
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const mSheet = ss.getSheetByName('Member Data');
    if (!mSheet) return [];
    const data = mSheet.getDataRange().getValues();
    const result = [];
    for (let i = 1; i < data.length; i++) {
      const policyNumber = String(data[i][0] || '').trim();
      const si = parseFloat(String(data[i][1]).replace(/[₹,$,\s]/g, ''));
      const lives = parseInt(data[i][2]);
      if (policyNumber && !isNaN(si) && si > 0 && lives > 0) {
        result.push({ policyNumber: policyNumber, sumInsured: si, lives: lives });
      }
    }
    return result;
  } catch (e) { return []; }
}

// ============ PER-POLICY LIVES DISTRIBUTION ============
// Sheet key 'self' unchanged internally; DISPLAY label becomes 'Employee'

function getOrCreateLivesDistributionSheet(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  let lSheet = ss.getSheetByName('Lives Distribution');
  if (!lSheet) {
    lSheet = ss.insertSheet('Lives Distribution');
    lSheet.appendRow(['Policy Number', 'Relation', 'Count']);
    lSheet.setFrozenRows(1);
  } else {
    const header = lSheet.getRange(1, 1, 1, lSheet.getLastColumn()).getValues()[0];
    if (String(header[0] || '').toLowerCase().indexOf('policy') === -1) {
      lSheet.insertColumnBefore(1);
      lSheet.getRange(1, 1).setValue('Policy Number');
    }
  }
  return lSheet;
}

function writePerPolicyLivesDistribution(sheetId, policies) {
  const lSheet = getOrCreateLivesDistributionSheet(sheetId);
  const lastRow = lSheet.getLastRow();
  if (lastRow > 1) lSheet.deleteRows(2, lastRow - 1);

  const relationKeys = [
    ['self', 'Employee'], ['spouse', 'Spouse'], ['son', 'Son'], ['daughter', 'Daughter'],
    ['father', 'Father'], ['mother', 'Mother'],
    ['fatherInLaw', 'Father in Law'], ['motherInLaw', 'Mother in Law'],
    ['others', 'Others']
  ];

  const rows = [];
  policies.forEach(p => {
    if (p.livesDistribution) {
      relationKeys.forEach(([key, label]) => {
        const count = p.livesDistribution[key] || 0;
        if (count > 0) rows.push([p.policyNumber, label, count]);
      });
    }
  });

  if (rows.length > 0) {
    lSheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }
}

function readPerPolicyLivesDistribution(sheetId) {
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const lSheet = ss.getSheetByName('Lives Distribution');
    if (!lSheet) return [];
    const data = lSheet.getDataRange().getValues();
    const result = [];
    for (let i = 1; i < data.length; i++) {
      const policyNumber = String(data[i][0] || '').trim();
      let relation = String(data[i][1] || '').trim().toLowerCase();
      if (relation === 'employee') relation = 'self';
      const count = parseInt(data[i][2]);
      if (policyNumber && relation && count > 0) {
        result.push({ policyNumber: policyNumber, relation: relation, count: count });
      }
    }
    return result;
  } catch (e) { return []; }
}

// ============ MEETING REQUESTS ============

function getMasterMeetingRequestsSheet() {
  const folder = getDashboardFolder();
  const files = folder.getFilesByName(MEETING_REQUESTS_MASTER_SHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.openById(files.next().getId());

  const sheet = SpreadsheetApp.create(MEETING_REQUESTS_MASTER_SHEET_NAME);
  const file = DriveApp.getFileById(sheet.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  const dataSheet = sheet.getActiveSheet();
  dataSheet.setName('Requests');
  dataSheet.appendRow(['Timestamp', 'Client ID', 'Client Name (Config)', 'Company Name', 'Phone', 'Email', 'Name', 'Designation', 'Preferred Time', 'Message']);
  dataSheet.setFrozenRows(1);
  return sheet;
}

function getOrCreateClientMeetingRequestsSheet(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  let mSheet = ss.getSheetByName('Meeting_Requests');
  if (!mSheet) {
    mSheet = ss.insertSheet('Meeting_Requests');
    mSheet.appendRow(['Timestamp', 'Company Name', 'Phone', 'Email', 'Name', 'Designation', 'Preferred Time', 'Message', 'Status']);
    mSheet.setFrozenRows(1);
  }
  return mSheet;
}

function submitMeetingRequest(payload) {
  try {
    if (payload.honeypot && String(payload.honeypot).trim() !== '') {
      return { success: false, error: 'Invalid submission' };
    }

    const clientId = String(payload.clientId || '').trim();
    const cache = CacheService.getScriptCache();
    const rateKey = 'meetrate_' + clientId;
    const currentRate = parseInt(cache.get(rateKey) || '0');
    if (currentRate >= 3) {
      return { success: false, error: 'Too many requests. Please try again later.' };
    }
    cache.put(rateKey, String(currentRate + 1), 3600);

    const companyName = String(payload.companyName || '').trim();
    const phone = String(payload.phone || '').trim();
    const email = String(payload.email || '').trim();
    const personName = String(payload.personName || '').trim();

    if (!companyName || !phone || !email || !personName) {
      return { success: false, error: 'Please fill all required fields' };
    }

    const designation = String(payload.designation || '').trim();
    const preferredTime = String(payload.preferredTime || '').trim();
    const message = String(payload.message || '').trim();
    const timestamp = new Date().toISOString();

    let clientConfigName = '';
    let clientSheetId = '';
    try {
      clientSheetId = getClientSheetId(clientId);
      if (clientSheetId) {
        const ss = SpreadsheetApp.openById(clientSheetId);
        const configSheet = ss.getSheetByName('Config');
        if (configSheet) {
          const cd = configSheet.getDataRange().getValues();
          for (let i = 1; i < cd.length; i++) {
            if (String(cd[i][0]).toLowerCase().trim() === 'client name') {
              clientConfigName = String(cd[i][1] || '');
              break;
            }
          }
        }
      }
    } catch (e) { console.log('Config read error:', e); }

    try {
      const master = getMasterMeetingRequestsSheet();
      const mSheet = master.getSheetByName('Requests');
      mSheet.appendRow([timestamp, clientId, clientConfigName, companyName, phone, email, personName, designation, preferredTime, message]);
    } catch (e) { console.log('Master save error:', e); }

    try {
      if (clientSheetId) {
        const mSheet = getOrCreateClientMeetingRequestsSheet(clientSheetId);
        mSheet.appendRow([timestamp, companyName, phone, email, personName, designation, preferredTime, message, 'New']);
      }
    } catch (e) { console.log('Client save error:', e); }

    try {
      const recipients = ['wellness@rahainsure.com', 'vishwanatha@rahainsure.com'];
      const subject = 'New OPD Meeting Request — ' + companyName;
      const body = [
        'A new meeting request has been submitted through the RAHA Dashboard.',
        '',
        'Company Name: ' + companyName,
        'Client Name (Config): ' + (clientConfigName || clientId),
        'Phone: ' + phone,
        'Email: ' + email,
        'Name: ' + personName,
        'Designation: ' + (designation || '(not specified)'),
        'Preferred Time: ' + (preferredTime || '(not specified)'),
        'Message: ' + (message || '(none)'),
        '',
        'Submitted at: ' + timestamp,
        'Client ID: ' + clientId
      ].join('\n');
      MailApp.sendEmail({ to: recipients.join(','), subject: subject, body: body });
    } catch (e) { console.log('Email send error:', e); }

    return { success: true, message: 'Thank you! Our team will reach out shortly.' };
  } catch (error) {
    console.error('submitMeetingRequest error:', error);
    return { success: false, error: error.toString() };
  }
}

// ============ GOOGLE SHEET DASHBOARD ============

function handleGoogleSheetDashboard(clientId) {
  console.log('Loading dashboard for client:', clientId);
  if (isClientInactive_(clientId)) return inactiveDashboardPage_();
  try {
    const sheetId = getClientSheetId(clientId);
    if (!sheetId) {
      return HtmlService.createHtmlOutput(
        '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dashboard Not Found</title><style>body{font-family:Arial,sans-serif;padding:40px;text-align:center;background:#f8fafc;}h2{color:#ef4444;}p{color:#6b7280;margin:20px 0;}a{display:inline-block;padding:10px 20px;background:#3b82f6;color:white;text-decoration:none;border-radius:5px;}</style></head><body><h2>⚠️ Client Not Found</h2><p>No dashboard found for client: ' + clientId + '</p><a href="' + ScriptApp.getService().getUrl() + '">Go to Home</a></body></html>'
      ).setTitle('Client Not Found');
    }

    const dashboardData = readGoogleSheetData(sheetId, clientId);
    const preventionContent = readPreventionContent(sheetId);
    const wellnessCalendar = readWellnessCalendar(sheetId);
    const policies = readPolicies(sheetId);
    const perPolicyMember = readPerPolicyMemberData(sheetId);
    const perPolicyLives = readPerPolicyLivesDistribution(sheetId);

    const html = HtmlService.createTemplateFromFile('Dashboard');
    html.dashboardData = JSON.stringify(dashboardData.data);
    html.columnMapping = JSON.stringify(dashboardData.columnMapping);
    html.hasClaims = dashboardData.hasClaims ? 'true' : 'false';
    html.premium = dashboardData.premium || 0;
    html.earnedPremium = dashboardData.earnedPremium || 0;
    html.dashboardId = 'gs_' + clientId;
    html.fileName = 'Dashboard - ' + (dashboardData.clientName || clientId);
    html.totalRecords = dashboardData.data.length;
    html.createdAt = new Date().toISOString();
    html.generationDate = dashboardData.generationDate || '';
    html.policyStartDate = dashboardData.policyStartDate || '';
    html.policyEndDate = dashboardData.policyEndDate || '';
    html.memberData = 'null';
    html.preventionContent = JSON.stringify(preventionContent);
    html.wellnessCalendar = JSON.stringify(wellnessCalendar);
    html.policies = JSON.stringify(policies);
    html.perPolicyMember = JSON.stringify(perPolicyMember);
    html.perPolicyLives = JSON.stringify(perPolicyLives);
    html.ageDataAvailable = dashboardData.ageDataAvailable ? 'true' : 'false';
    html.clientName = dashboardData.clientName || clientId;
    html.clientId = clientId;

    return html.evaluate()
      .setTitle('Dashboard - ' + (dashboardData.clientName || clientId))
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Error</title></head><body><h2>Error Loading Dashboard</h2><p>' + error.message + '</p></body></html>'
    ).setTitle('Error');
  }
}

// ============ CLIENT MAPPING ============

function getClientSheetId(clientId) {
  try {
    const props = PropertiesService.getScriptProperties();
    const mapping = props.getProperty('client_mapping');
    if (mapping) {
      const map = JSON.parse(mapping);
      if (map[clientId]) return map[clientId];
    }
    try {
      const sheetFile = DriveApp.getFilesByName(CLIENT_MAPPING_SHEET_NAME);
      if (sheetFile.hasNext()) {
        const file = sheetFile.next();
        const sheet = SpreadsheetApp.openById(file.getId()).getSheets()[0];
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === clientId) return data[i][2];
        }
      }
    } catch (e) { console.log('Error reading mapping sheet:', e); }
    return null;
  } catch (error) { return null; }
}

function saveClientMapping(clientId, sheetId, clientName, shareUrl) {
  try {
    const props = PropertiesService.getScriptProperties();
    let mapping = props.getProperty('client_mapping');
    let map = mapping ? JSON.parse(mapping) : {};
    map[clientId] = sheetId;
    props.setProperty('client_mapping', JSON.stringify(map));

    const EXPECTED_HEADERS = ['Client ID', 'Client Name', 'Sheet ID', 'Shareable Link', 'Created At'];
    let sheetFile;
    const files = DriveApp.getFilesByName(CLIENT_MAPPING_SHEET_NAME);

    if (files.hasNext()) {
      sheetFile = files.next();
      const sheet = SpreadsheetApp.openById(sheetFile.getId());
      let dataSheet = sheet.getSheets()[0];
      const lastCol = dataSheet.getLastColumn();
      const headerRow = lastCol > 0 ? dataSheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

      const headersMatch = headerRow.length >= 5
        && headerRow[0] === EXPECTED_HEADERS[0] && headerRow[1] === EXPECTED_HEADERS[1]
        && headerRow[2] === EXPECTED_HEADERS[2] && headerRow[3] === EXPECTED_HEADERS[3];

      if (!headersMatch) {
        const allData = dataSheet.getDataRange().getValues();
        dataSheet.clear();
        dataSheet.getRange(1, 1, 1, EXPECTED_HEADERS.length).setValues([EXPECTED_HEADERS]);
        if (allData.length > 1) {
          const migratedRows = [];
          for (let i = 1; i < allData.length; i++) {
            const oldRow = allData[i];
            const oldClientId = oldRow[0] || '';
            if (!oldClientId) continue;
            let newRow;
            if (oldRow.length >= 5) newRow = [oldRow[0], oldRow[1], oldRow[2], oldRow[3], oldRow[4]];
            else if (oldRow.length === 4) newRow = [oldRow[0], oldRow[1], oldRow[2], '', oldRow[3]];
            else {
              const webappUrl = ScriptApp.getService().getUrl();
              newRow = [oldClientId, '', oldRow[1] || '', `${webappUrl}?clientId=${oldClientId}`, oldRow[2] || ''];
            }
            migratedRows.push(newRow);
          }
          if (migratedRows.length > 0) dataSheet.getRange(2, 1, migratedRows.length, EXPECTED_HEADERS.length).setValues(migratedRows);
        }
      }

      const freshData = dataSheet.getDataRange().getValues();
      let exists = false;
      for (let i = 1; i < freshData.length; i++) {
        if (freshData[i][0] === clientId) {
          dataSheet.getRange(i + 1, 2).setValue(clientName || '');
          dataSheet.getRange(i + 1, 3).setValue(sheetId || '');
          dataSheet.getRange(i + 1, 4).setValue(shareUrl || '');
          if (!freshData[i][4]) dataSheet.getRange(i + 1, 5).setValue(new Date().toISOString());
          exists = true;
          break;
        }
      }
      if (!exists) {
        ensureStatusColumn_(dataSheet);
        dataSheet.appendRow([clientId, clientName || '', sheetId || '', shareUrl || '', new Date().toISOString(), 'Active']);
      }
    } else {
      sheetFile = SpreadsheetApp.create(CLIENT_MAPPING_SHEET_NAME);
      const dataSheet = sheetFile.getActiveSheet();
      dataSheet.appendRow(EXPECTED_HEADERS.concat(['Status']));
      dataSheet.appendRow([clientId, clientName || '', sheetId || '', shareUrl || '', new Date().toISOString(), 'Active']);
      ensureStatusColumn_(dataSheet);
    }
    return true;
  } catch (error) {
    console.error('saveClientMapping error:', error);
    return false;
  }
}

function getAllClients() {
  try {
    const props = PropertiesService.getScriptProperties();
    const mapping = props.getProperty('client_mapping');
    return mapping ? Object.keys(JSON.parse(mapping)) : [];
  } catch (error) { return []; }
}

function getClientDetailsFromMapping(clientId) {
  try {
    const sheetFile = DriveApp.getFilesByName(CLIENT_MAPPING_SHEET_NAME);
    if (sheetFile.hasNext()) {
      const file = sheetFile.next();
      const sheet = SpreadsheetApp.openById(file.getId()).getSheets()[0];
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === clientId) return {
          clientId: data[i][0] || '', clientName: data[i][1] || '',
          sheetId: data[i][2] || '', shareUrl: data[i][3] || '', createdAt: data[i][4] || ''
        };
      }
    }
  } catch (error) {}
  return null;
}

function removeClientFromMapping(clientId) {
  try {
    const sheetFile = DriveApp.getFilesByName(CLIENT_MAPPING_SHEET_NAME);
    if (sheetFile.hasNext()) {
      const file = sheetFile.next();
      const sheet = SpreadsheetApp.openById(file.getId()).getSheets()[0];
      const data = sheet.getDataRange().getValues();
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][0] === clientId) sheet.deleteRow(i + 1);
      }
    }
    return true;
  } catch (error) { return false; }
}

// ============ CLIENT STATUS (Active / Inactive) ============
// Status lives in column F ("Status") of the Client_Mapping sheet.
// Blank or "Active" = dashboard visible. "Inactive" = dashboard shows a "contact RAHA" message.
const SUPPORT_EMAIL = 'support@rahainsure.com';
const STATUS_CACHE_KEY = 'client_status_map_v1';
const STATUS_COL = 6;

function getMappingSpreadsheet_() {
  const files = DriveApp.getFilesByName(CLIENT_MAPPING_SHEET_NAME);
  if (!files.hasNext()) return null;
  return SpreadsheetApp.openById(files.next().getId());
}

function getMappingSheet_() {
  const ss = getMappingSpreadsheet_();
  return ss ? ss.getSheets()[0] : null;
}

// ============ HOME PAGE PERMISSIONS ============
// Who may manage dashboards from the Home page is controlled by the "Admins" tab of the Client_Mapping sheet:
//   Email | Role     Role "Admin" or "Editor" = can activate/deactivate dashboards
//   anyone not listed = view / open only
// DELETE is allowed ONLY for SUPER_ADMIN_EMAIL (always has full access). Changing it requires editing this file.
const SUPER_ADMIN_EMAIL = 'vishwanatha@rahainsure.com';
const ADMINS_SHEET_NAME = 'Admins';

function getAdminsSheet_(ss) {
  let sh = ss.getSheetByName(ADMINS_SHEET_NAME);
  if (sh) return sh;
  sh = ss.insertSheet(ADMINS_SHEET_NAME);
  sh.appendRow(['Email', 'Role (Admin or Editor = can activate/deactivate; delete is owner-only)']);
  sh.appendRow([SUPER_ADMIN_EMAIL, 'Admin']);
  sh.getRange(2, 2, 200, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Admin', 'Editor'], true).setAllowInvalid(false).build());
  sh.setColumnWidth(1, 280); sh.setColumnWidth(2, 340);
  return sh;
}

function getCurrentUserEmail_() {
  try { return String(Session.getActiveUser().getEmail() || '').trim().toLowerCase(); } catch (e) { return ''; }
}

function getRoleForEmail_(ss, email) {
  if (!email) return 'None';
  if (email === SUPER_ADMIN_EMAIL.toLowerCase()) return 'Admin';
  try {
    const rows = getAdminsSheet_(ss).getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0] || '').trim().toLowerCase() === email) {
        const role = String(rows[i][1] || '').trim().toLowerCase();
        return role === 'admin' ? 'Admin' : (role === 'editor' ? 'Editor' : 'None');
      }
    }
  } catch (error) { console.error('getRoleForEmail_ error:', error); }
  return 'None';
}

function getPermissions_(ss) {
  const email = getCurrentUserEmail_();
  const role = ss ? getRoleForEmail_(ss, email) : (email === SUPER_ADMIN_EMAIL.toLowerCase() ? 'Admin' : 'None');
  // Delete is reserved for SUPER_ADMIN_EMAIL only; Admin/Editor rows in the Admins tab can activate/deactivate
  return { email: email, role: role, canDelete: email === SUPER_ADMIN_EMAIL.toLowerCase(), canToggle: role === 'Admin' || role === 'Editor' };
}

// Adds the Status header + Active/Inactive dropdown the first time it is needed
function ensureStatusColumn_(sheet) {
  if (sheet.getMaxColumns() < STATUS_COL) sheet.insertColumnsAfter(sheet.getMaxColumns(), STATUS_COL - sheet.getMaxColumns());
  const header = String(sheet.getRange(1, STATUS_COL).getValue() || '').trim();
  if (header === 'Status') return;
  sheet.getRange(1, STATUS_COL).setValue('Status');
  const rows = Math.max(sheet.getMaxRows() - 1, 1);
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(['Active', 'Inactive'], true).setAllowInvalid(false).build();
  sheet.getRange(2, STATUS_COL, rows, 1).setDataValidation(rule);
}

// One read of the whole mapping sheet -> array of client rows
function readClientMappingRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    const clientId = String(r[0] || '').trim();
    if (!clientId) continue;
    let created = r[4];
    if (created instanceof Date) created = created.toISOString();
    rows.push({
      clientId: clientId,
      clientName: String(r[1] || ''),
      sheetId: String(r[2] || ''),
      shareUrl: String(r[3] || ''),
      createdAt: created ? String(created) : '',
      status: String(r[STATUS_COL - 1] || '').trim().toLowerCase() === 'inactive' ? 'Inactive' : 'Active'
    });
  }
  return rows;
}

// clientId -> 'Active' | 'Inactive' (cached for 60 seconds so every dashboard view stays fast)
function getClientStatusMap_() {
  const cache = CacheService.getScriptCache();
  try {
    const cached = cache.get(STATUS_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  const map = {};
  try {
    const sheet = getMappingSheet_();
    if (sheet) readClientMappingRows_(sheet).forEach(r => { map[r.clientId] = r.status; });
    try { cache.put(STATUS_CACHE_KEY, JSON.stringify(map), 60); } catch (e) {}
  } catch (error) {
    console.error('getClientStatusMap_ error:', error);   // fail open: an unreadable sheet must not lock everyone out
  }
  return map;
}

function isClientInactive_(clientId) {
  return getClientStatusMap_()[String(clientId).trim()] === 'Inactive';
}

function inactiveDashboardPage_() {
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dashboard Unavailable</title>' +
    '<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#e8f5e0,#c9e4c0);font-family:Arial,sans-serif;}' +
    '.box{background:#fff;border-radius:24px;padding:40px 36px;max-width:460px;margin:20px;text-align:center;box-shadow:0 12px 40px rgba(60,120,60,.18);}' +
    'h2{color:#1f3f2a;margin:12px 0 8px;}p{color:#4b5f4b;line-height:1.6;margin:8px 0;}a{color:#2d7a3a;font-weight:700;text-decoration:none;}</style></head>' +
    '<body><div class="box"><div style="font-size:3rem">🌿</div><h2>Dashboard currently unavailable</h2>' +
    '<p>This dashboard is not active at the moment.</p>' +
    '<p>Please contact the RAHA team at <a href="mailto:' + SUPPORT_EMAIL + '">' + SUPPORT_EMAIL + '</a>.</p></div></body></html>'
  ).setTitle('Dashboard Unavailable');
}

// Called from the Home page toggle
function setClientStatus(clientId, status) {
  try {
    const normalized = String(status || '').trim().toLowerCase() === 'inactive' ? 'Inactive'
      : (String(status || '').trim().toLowerCase() === 'active' ? 'Active' : null);
    if (!normalized) return { success: false, error: 'Status must be Active or Inactive' };
    const ss = getMappingSpreadsheet_();
    if (!ss) return { success: false, error: 'Client mapping sheet not found' };
    if (!getPermissions_(ss).canToggle) return { success: false, error: 'You do not have permission to change dashboard status.' };
    const sheet = ss.getSheets()[0];
    ensureStatusColumn_(sheet);
    const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
    for (let i = 1; i < ids.length; i++) {
      if (String(ids[i][0]).trim() === String(clientId).trim()) {
        sheet.getRange(i + 1, STATUS_COL).setValue(normalized);
        CacheService.getScriptCache().remove(STATUS_CACHE_KEY);
        return { success: true, status: normalized };
      }
    }
    return { success: false, error: 'Client not found in the mapping sheet' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============ SHEET READ ============

function readGoogleSheetData(sheetId, clientId) {
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const sheets = ss.getSheets();

    let columnMapping = {}, claimsData = [], premium = 0, earnedPremium = 0;
    let generationDate = '', policyStartDate = '', policyEndDate = '', clientName = '';
    let hasClaims = false, ageDataAvailable = false;

    sheets.forEach(sheet => {
      const sheetName = sheet.getName();
      const data = sheet.getDataRange().getValues();
      if (data.length < 1) return;
      const headers = data[0];

      if (sheetName.toLowerCase().includes('config')) {
        for (let i = 1; i < data.length; i++) {
          const key = String(data[i][0] || '').toLowerCase().trim();
          const value = data[i][1];
          if (key === 'generation date') generationDate = String(value || '');
          else if (key === 'policy start date') policyStartDate = String(value || '');
          else if (key === 'policy end date') policyEndDate = String(value || '');
          else if (key === 'client name') clientName = String(value || '');
          else if (key === 'premium') { const a = parseFloat(String(value).replace(/[₹,$,\s]/g, '')); if (!isNaN(a)) premium = a; }
          else if (key === 'earned premium') { const a = parseFloat(String(value).replace(/[₹,$,\s]/g, '')); if (!isNaN(a)) earnedPremium = a; }
          else if (key === 'age data available') ageDataAvailable = String(value || '').toLowerCase() === 'yes' || value === true;
        }
      } else if (sheetName.toLowerCase() === 'claims data' || sheetName.toLowerCase() === 'claims') {
        if (data.length > 1) {
          hasClaims = true;
          claimsData = parseSheetData(data, headers);
          columnMapping = autoMapGoogleSheetColumns(headers);
        }
      }
    });

    return {
      data: claimsData, columnMapping: columnMapping, hasClaims: hasClaims,
      premium: premium, earnedPremium: earnedPremium, memberData: null,
      generationDate: generationDate, policyStartDate: policyStartDate,
      policyEndDate: policyEndDate, clientName: clientName, ageDataAvailable: ageDataAvailable
    };
  } catch (error) { throw new Error('Failed to read Google Sheet: ' + error.message); }
}

function parseSheetData(data, headers) {
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    headers.forEach((header, colIndex) => {
      if (header && header.toString().trim() !== '') {
        const value = row[colIndex];
        obj[header.toString().trim()] = (value !== null && value !== undefined) ? value : '';
      }
    });
    if (Object.keys(obj).length > 0) rows.push(obj);
  }
  return rows;
}

function autoMapGoogleSheetColumns(headers) {
  return autoMapByPatterns(headers);
}

function autoMapByPatterns(headers) {
  const mapping = {};
  const lowerHeaders = headers.map(h => h ? h.toString().toLowerCase().trim() : '');
  const patterns = {
    claimId: ['claimid', 'claim id'],
    employeeCode: ['emp_code', 'employee code', 'empcode'],
    employeeName: ['name', 'employee name', 'emp name'],
    claimType: ['claims', 'claim type', 'type'],
    category: ['category', 'status', 'claim status'],
    disease: ['icd', 'disease', 'diagnosis', 'service type', 'service_type'],
    diagnosis: ['diagnosis'],
    hospital: ['hsp', 'hospital', 'provider'],
    relation: ['rltn', 'relation', 'relationship'],
    hospitalCity: ['hsp_city', 'hospital city', 'city'],
    sumInsured: ['si', 'sum insured', 'suminsured', 'wallet', 'wallet amount'],
    claimedAmount: ['claimed_amount', 'claimed amount', 'billed amount'],
    paidAmount: ['paid', 'paid amount', 'settled amount'],
    totalAmount: ['total_amount', 'total amount', 'approved amount'],
    outstandingAmount: ['os', 'outstanding', 'outstanding amount'],
    deniedReason: ['denied reason', 'denial reason', 'denial remarks', 'remarks', 'comments'],
    claimReceivedDate: ['claim received date', 'received date', 'claim date', 'date of claim', 'submission date'],
    policyNumber: ['policy number', 'policy_number', 'policynumber'],
    policyType: ['policy type', 'policy_type', 'policytype'],
    age: ['age'],
    gender: ['gender', 'sex']
  };
  for (const [field, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      const index = lowerHeaders.indexOf(keyword.toLowerCase());
      if (index !== -1 && headers[index]) {
        mapping[field] = headers[index].toString().trim();
        break;
      }
    }
  }
  return mapping;
}

function autoMapColumns(headers) {
  return autoMapByPatterns(headers);
}

// ============ CREATE GOOGLE SHEET ============

function createClientGoogleSheet(clientId, data) {
  try {
    const sheetName = (data.clientName && data.clientName.trim() !== '')
      ? data.clientName.trim() + '_Dashboard'
      : 'Dashboard_' + clientId;

    const ss = SpreadsheetApp.create(sheetName);
    const sheetId = ss.getId();

    const folder = getDashboardFolder();
    const file = DriveApp.getFileById(sheetId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    const configSheet = ss.getSheetByName('Sheet1');
    if (configSheet) configSheet.setName('Config');

    const claimsSheet = ss.insertSheet('Claims Data');

    configSheet.appendRow(['Key', 'Value']);
    configSheet.appendRow(['Client ID', clientId]);
    configSheet.appendRow(['Client Name', data.clientName || '']);
    configSheet.appendRow(['File Name', data.fileName || '']);
    configSheet.appendRow(['Premium', data.premium || 0]);
    configSheet.appendRow(['Earned Premium', data.earnedPremium || 0]);
    configSheet.appendRow(['Generation Date', data.generationDate || '']);
    configSheet.appendRow(['Age Data Available', data.ageDataAvailable ? 'Yes' : 'No']);
    configSheet.appendRow(['Created At', new Date().toISOString()]);

    if (data.data && data.data.length > 0) {
      const headers = Object.keys(data.data[0]);
      claimsSheet.appendRow(headers);
      data.data.forEach(row => {
        claimsSheet.appendRow(headers.map(h => row[h] !== undefined ? row[h] : ''));
      });
    } else {
      claimsSheet.appendRow([
        'Claim ID', 'EMP_CODE', 'Name', 'Claims', 'Category', 'ICD', 'Diagnosis',
        'HSP', 'HSP_CITY', 'Rltn', 'Claimed_Amount', 'Paid', 'Total_amount', 'OS',
        'Denied Reason', 'Claim Received Date', 'Policy Number', 'Policy Type', 'Age', 'Gender'
      ]);
    }

    getOrCreateWellnessCalendarSheet(sheetId);
    getOrCreatePoliciesSheet(sheetId);
    getOrCreateClientMeetingRequestsSheet(sheetId);
    getOrCreateMemberDataSheet(sheetId);
    getOrCreateLivesDistributionSheet(sheetId);

    writePoliciesToSheet(sheetId, data.policies || []);
    writePerPolicyMemberData(sheetId, data.policies || []);
    writePerPolicyLivesDistribution(sheetId, data.policies || []);

    if (data.uniqueICDs && data.uniqueICDs.length > 0) {
      generatePreventionContentForClient(sheetId, data.uniqueICDs);
    } else {
      if (!ss.getSheetByName('Prevention Content')) {
        const pcSheet = ss.insertSheet('Prevention Content');
        pcSheet.appendRow(['ICD', 'How to Prevent', 'How to Manage', 'Bucket', 'Source', 'Organ System']);
        pcSheet.setFrozenRows(1);
      }
    }

    try { saveClientMapping(clientId, sheetId, data.clientName, data.shareUrl); } catch (e) {}

    try { installDashboardMenuTriggerForSheet(sheetId); } catch (e) { console.log('Trigger install failed:', e); }

    return sheetId;
  } catch (error) {
    throw new Error('Failed to create Google Sheet: ' + error.message);
  }
}

// ============ UPDATE GOOGLE SHEET ============

function updateClientGoogleSheet(clientId, data) {
  try {
    const sheetId = getClientSheetId(clientId);
    if (!sheetId) return createClientGoogleSheet(clientId, data);

    const ss = SpreadsheetApp.openById(sheetId);

    if (data.clientName && data.clientName.trim() !== '') {
      try { ss.rename(data.clientName.trim() + '_Dashboard'); } catch (e) {}
    }

    let configSheet = ss.getSheetByName('Config');
    if (!configSheet) {
      configSheet = ss.insertSheet('Config', 0);
      configSheet.appendRow(['Key', 'Value']);
      configSheet.appendRow(['Client ID', clientId]);
    }

    const configData = configSheet.getDataRange().getValues();
    const configMap = {};
    for (let i = 1; i < configData.length; i++) {
      configMap[String(configData[i][0]).toLowerCase()] = i + 1;
    }

    const setConfig = (key, value) => {
      const lowerKey = key.toLowerCase();
      if (configMap[lowerKey]) configSheet.getRange(configMap[lowerKey], 2).setValue(value);
      else configSheet.appendRow([key, value]);
    };

    setConfig('Client Name', data.clientName || '');
    setConfig('File Name', data.fileName || '');
    setConfig('Premium', data.premium || 0);
    setConfig('Earned Premium', data.earnedPremium || 0);
    setConfig('Generation Date', data.generationDate || '');
    setConfig('Age Data Available', data.ageDataAvailable ? 'Yes' : 'No');
    setConfig('Last Updated', new Date().toISOString());

    const claimsSheet = ss.getSheetByName('Claims Data');
    if (claimsSheet) {
      const lastRow = claimsSheet.getLastRow();
      if (lastRow > 1) claimsSheet.deleteRows(2, lastRow - 1);
      if (data.data && data.data.length > 0) {
        const headers = Object.keys(data.data[0]);
        const existingHeaders = claimsSheet.getRange(1, 1, 1, claimsSheet.getLastColumn()).getValues()[0];
        if (existingHeaders.length === 0 || !existingHeaders[0]) claimsSheet.appendRow(headers);
        data.data.forEach(row => {
          claimsSheet.appendRow(headers.map(h => row[h] !== undefined ? row[h] : ''));
        });
      }
    }

    getOrCreateWellnessCalendarSheet(sheetId);
    getOrCreateClientMeetingRequestsSheet(sheetId);
    getOrCreatePoliciesSheet(sheetId);
    getOrCreateMemberDataSheet(sheetId);
    getOrCreateLivesDistributionSheet(sheetId);

    writePoliciesToSheet(sheetId, data.policies || []);
    writePerPolicyMemberData(sheetId, data.policies || []);
    writePerPolicyLivesDistribution(sheetId, data.policies || []);

    if (data.uniqueICDs && data.uniqueICDs.length > 0) {
      generatePreventionContentForClient(sheetId, data.uniqueICDs);
    } else {
      if (!ss.getSheetByName('Prevention Content')) {
        const pcSheet = ss.insertSheet('Prevention Content');
        pcSheet.appendRow(['ICD', 'How to Prevent', 'How to Manage', 'Bucket', 'Source', 'Organ System']);
        pcSheet.setFrozenRows(1);
      }
    }

    saveClientMapping(clientId, sheetId, data.clientName, data.shareUrl);

    try { installDashboardMenuTriggerForSheet(sheetId); } catch (e) { console.log('Trigger install failed:', e); }

    return sheetId;
  } catch (error) {
    throw new Error('Failed to update Google Sheet: ' + error.message);
  }
}

// ============ TRIGGER MANAGEMENT ============

function installDashboardMenuTriggerForSheet(sheetId) {
  try {
    const functionName = 'buildDashboardMenu';
    const existing = ScriptApp.getProjectTriggers();

    for (const t of existing) {
      if (t.getHandlerFunction() === functionName && t.getTriggerSourceId() === sheetId) {
        return;
      }
    }

    ScriptApp.newTrigger(functionName)
      .forSpreadsheet(sheetId)
      .onOpen()
      .create();

    console.log('✅ Menu trigger installed for sheet:', sheetId);
  } catch (e) {
    console.log('Trigger install error:', e);
  }
}

// ============ MENU BUILDER ============

function buildDashboardMenu(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;
    const configSheet = ss.getSheetByName('Config');
    if (!configSheet) return;
    const clientId = getClientIdFromSheet(ss);
    if (!clientId) return;

    SpreadsheetApp.getUi()
      .createMenu('RAHA Dashboard')
      .addItem('🔄 Refresh from this Sheet', 'refreshClientDashboardFromSheet')
      .addItem('🔍 Check ICDs Only', 'checkICDsOnlyForCurrentSheet')
      .addSeparator()
      .addItem('📖 Open Dashboard', 'openDashboardForCurrentSheet')
      .addToUi();
  } catch (e) {
    console.log('buildDashboardMenu error:', e);
  }
}

function getClientIdFromSheet(spreadsheet) {
  try {
    const configSheet = spreadsheet.getSheetByName('Config');
    if (!configSheet) return null;
    const data = configSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase().trim() === 'client id') return String(data[i][1] || '').trim();
    }
  } catch (e) {}
  return null;
}

function refreshClientDashboardFromSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const clientId = getClientIdFromSheet(ss);
    if (!clientId) {
      SpreadsheetApp.getUi().alert('Error', 'Client ID not found in Config tab.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    const sheetId = ss.getId();
    const claimsSheet = ss.getSheetByName('Claims Data');
    if (!claimsSheet) {
      SpreadsheetApp.getUi().alert('Error', 'Claims Data tab not found.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    const claimsData = claimsSheet.getDataRange().getValues();
    const hasClaims = claimsData.length > 1;
    let uniqueICDs = [];
    let claims = [];

    if (hasClaims) {
      const headers = claimsData[0];
      claims = parseSheetData(claimsData, headers);
      const colMap = autoMapGoogleSheetColumns(headers);
      uniqueICDs = extractUniqueICDs(claims, colMap);
    }

    let newICDs = [];
    if (uniqueICDs.length > 0) {
      newICDs = detectNewICDs(uniqueICDs);
      generatePreventionContentForClient(sheetId, uniqueICDs);
    }

    const configSheet = ss.getSheetByName('Config');
    if (configSheet) {
      const configData = configSheet.getDataRange().getValues();
      for (let i = 1; i < configData.length; i++) {
        if (String(configData[i][0]).toLowerCase().trim() === 'last updated') {
          configSheet.getRange(i + 1, 2).setValue(new Date().toISOString());
          break;
        }
      }
    }

    let msg = '✅ Dashboard refreshed.\n\nClaims: ' + (hasClaims ? claims.length : 0) + '\nUnique ICDs: ' + uniqueICDs.length + '\nNew ICDs: ' + newICDs.length;
    if (newICDs.length > 0) {
      msg += '\n\nNew ICDs:';
      newICDs.slice(0, 10).forEach(icd => { msg += '\n• ' + icd; });
    }
    SpreadsheetApp.getUi().alert('Refresh Complete', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function checkICDsOnlyForCurrentSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const clientId = getClientIdFromSheet(ss);
    if (!clientId) {
      SpreadsheetApp.getUi().alert('Error', 'Client ID not found.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const claimsSheet = ss.getSheetByName('Claims Data');
    if (!claimsSheet) {
      SpreadsheetApp.getUi().alert('Error', 'Claims Data tab not found.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const claimsData = claimsSheet.getDataRange().getValues();
    if (claimsData.length < 2) {
      SpreadsheetApp.getUi().alert('Info', 'No claims data.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const headers = claimsData[0];
    const claims = parseSheetData(claimsData, headers);
    const colMap = autoMapGoogleSheetColumns(headers);
    const uniqueICDs = extractUniqueICDs(claims, colMap);
    const newICDs = detectNewICDs(uniqueICDs);
    generatePreventionContentForClient(ss.getId(), uniqueICDs);

    let msg = '✅ ICD check complete.\n\nTotal ICDs: ' + uniqueICDs.length + '\nNew: ' + newICDs.length;
    if (newICDs.length > 0) {
      msg += '\n\n' + newICDs.slice(0, 10).join('\n');
    }
    SpreadsheetApp.getUi().alert('ICD Check', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function openDashboardForCurrentSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const clientId = getClientIdFromSheet(ss);
    if (!clientId) {
      SpreadsheetApp.getUi().alert('Error', 'Client ID not found.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const webappUrl = ScriptApp.getService().getUrl();
    const url = webappUrl + '?clientId=' + clientId;
    const html = HtmlService.createHtmlOutput(
      '<div style="font-family:Arial,sans-serif;padding:20px;text-align:center;">' +
      '<h3>Open Dashboard</h3><p>Click the link below:</p>' +
      '<a href="' + url + '" target="_blank" style="display:inline-block;padding:12px 24px;background:#4ca85a;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Open Dashboard →</a>' +
      '<p style="margin-top:20px;font-size:12px;color:#666;">' + url + '</p></div>'
    ).setWidth(500).setHeight(280);
    SpreadsheetApp.getUi().showModalDialog(html, 'Open Dashboard');
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ============ HANDLE FILE UPLOAD (POST) ============

function handleFileUpload(e, clientId) {
  try {
    if (e.postData && e.postData.contents) {
      const data = JSON.parse(e.postData.contents);
      data.clientId = clientId;
      const result = uploadFile(data);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
    throw new Error('Invalid request format');
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: error.toString(), message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============ PAGE HANDLERS ============

function getDashboardFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function handleHomePage() {
  const html = HtmlService.createTemplateFromFile('Home');
  return html.evaluate()
    .setTitle('Claims Dashboard Manager')
    .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/google_fonts_blue_48dp.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function handleUploadPage() {
  const html = HtmlService.createTemplateFromFile('Upload');
  return html.evaluate()
    .setTitle('Upload Excel Data')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function handleDashboardView(dashboardId) {
  const dashboardData = getDashboardData(dashboardId);
  if (!dashboardData) {
    return HtmlService.createHtmlOutput('<html><body><h2>Dashboard Not Found</h2></body></html>').setTitle('Dashboard Not Found');
  }

  const html = HtmlService.createTemplateFromFile('Dashboard');
  html.dashboardData = JSON.stringify(dashboardData.data);
  html.columnMapping = JSON.stringify(dashboardData.columnMapping);
  html.hasClaims = dashboardData.hasClaims !== false ? 'true' : 'false';
  html.premium = dashboardData.premium || 0;
  html.earnedPremium = dashboardData.earnedPremium || 0;
  html.dashboardId = dashboardId;
  html.fileName = dashboardData.fileName || 'Dashboard';
  html.totalRecords = dashboardData.data.length;
  html.createdAt = dashboardData.createdAt;
  html.generationDate = dashboardData.generationDate || '';
  html.policyStartDate = dashboardData.policyStartDate || '';
  html.policyEndDate = dashboardData.policyEndDate || '';
  html.memberData = 'null';
  html.preventionContent = '{}';
  html.wellnessCalendar = '[]';
  html.policies = JSON.stringify([{
    policyNumber: 'PRIMARY', policyType: 'ESC', premium: dashboardData.premium || 0,
    earnedPremium: dashboardData.earnedPremium || 0, lives: 0,
    startDate: dashboardData.policyStartDate || '', endDate: dashboardData.policyEndDate || '', visibility: 'Active'
  }]);
  html.perPolicyMember = '[]';
  html.perPolicyLives = '[]';
  html.ageDataAvailable = 'false';
  html.clientName = dashboardData.fileName || 'Dashboard';
  html.clientId = dashboardId;

  return html.evaluate()
    .setTitle(dashboardData.fileName + ' - Claims Analytics')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDashboardData(id) {
  try {
    const folder = getDashboardFolder();
    const files = folder.getFilesByName(`dashboard_${id}.json`);
    if (files.hasNext()) return JSON.parse(files.next().getBlob().getDataAsString());
  } catch (error) {}
  return null;
}

// Builds the client list from ONE read of the mapping sheet. A client exists only if it is in the script
// property (deleting from Home removes it there), so stale rows left in the sheet never reappear.
function buildDashboards_(sheet) {
  const webappUrl = ScriptApp.getService().getUrl();
  let map = {};
  try {
    const mapping = PropertiesService.getScriptProperties().getProperty('client_mapping');
    map = mapping ? JSON.parse(mapping) : {};
  } catch (error) {}
  const rowsById = {};
  try {
    if (sheet) {
      ensureStatusColumn_(sheet);
      readClientMappingRows_(sheet).forEach(r => { if (!rowsById[r.clientId]) rowsById[r.clientId] = r; });
    }
  } catch (error) { console.error('buildDashboards_ read error:', error); }
  const dashboards = Object.keys(map).map(clientId => {
    const r = rowsById[clientId];
    return {
      id: 'gs_' + clientId, fileName: (r && r.clientName) || clientId, clientId: clientId,
      clientName: (r && r.clientName) || clientId, sheetId: map[clientId],
      shareUrl: (r && r.shareUrl) || (webappUrl + '?clientId=' + clientId),
      createdAt: r ? r.createdAt : '', status: r ? r.status : 'Active', records: 0
    };
  });
  dashboards.sort((x, y) => String(y.createdAt).localeCompare(String(x.createdAt)));   // newest first
  return dashboards;
}

function getAllDashboards() {
  return buildDashboards_(getMappingSheet_());
}

// Used by the Home page: client list + what the signed-in user is allowed to do, in one call
function getHomeData() {
  const ss = getMappingSpreadsheet_();
  return {
    dashboards: buildDashboards_(ss ? ss.getSheets()[0] : null),
    permissions: getPermissions_(ss)
  };
}

function deleteDashboard(id) {
  try {
    if (!getPermissions_(getMappingSpreadsheet_()).canDelete) {
      return { success: false, error: 'You do not have permission to delete dashboards.' };
    }
    if (id.startsWith('gs_')) {
      const clientId = id.replace('gs_', '');
      const details = getClientDetailsFromMapping(clientId);
      const sheetId = details ? details.sheetId : getClientSheetId(clientId);

      const props = PropertiesService.getScriptProperties();
      let mapping = props.getProperty('client_mapping');
      if (mapping) {
        const map = JSON.parse(mapping);
        delete map[clientId];
        props.setProperty('client_mapping', JSON.stringify(map));
      }
      removeClientFromMapping(clientId);
      try { CacheService.getScriptCache().remove(STATUS_CACHE_KEY); } catch (e) {}

      if (sheetId) {
        try {
          const file = DriveApp.getFileById(sheetId);
          file.setTrashed(true);
        } catch (e) {}
      }
      return { success: true, message: 'Dashboard deleted' };
    }
    return { success: false, error: 'Invalid dashboard ID' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getDashboardDataApi(id) {
  if (id.startsWith('gs_')) {
    const clientId = id.replace('gs_', '');
    if (isClientInactive_(clientId)) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Dashboard unavailable. Please contact ' + SUPPORT_EMAIL }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const data = readGoogleSheetData(getClientSheetId(clientId), clientId);
    return ContentService.createTextOutput(JSON.stringify({
      success: true, data: data.data, columnMapping: data.columnMapping,
      hasClaims: data.hasClaims, premium: data.premium || 0,
      earnedPremium: data.earnedPremium || 0, memberData: null
    })).setMimeType(ContentService.MimeType.JSON);
  }
  const dashboardData = getDashboardData(id);
  if (!dashboardData) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Dashboard not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({
    success: true, data: dashboardData.data, columnMapping: dashboardData.columnMapping,
    premium: dashboardData.premium || 0, earnedPremium: dashboardData.earnedPremium || 0, memberData: null
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============ HELPERS ============

function getOrCreateTempFolder() {
  const folders = DriveApp.getFoldersByName('ClaimsDashboard_Temp');
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder('ClaimsDashboard_Temp');
}

function parseExcelFile(fileContent, fileName) {
  try {
    const decoded = Utilities.base64Decode(fileContent);
    const blob = Utilities.newBlob(decoded, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fileName);
    const tempFolder = getOrCreateTempFolder();
    const tempFile = tempFolder.createFile(blob);
    const googleFile = Drive.Files.copy({ title: 'temp_sheet_' + Date.now(), mimeType: MimeType.GOOGLE_SHEETS }, tempFile.getId());
    const ss = SpreadsheetApp.openById(googleFile.id);
    const sheet = ss.getSheets()[0];
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    if (lastRow <= 1 || lastColumn < 2) throw new Error('Excel file has no data');
    const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
    const headers = values[0];
    const rows = values.slice(1);
    const columnMapping = autoMapColumns(headers);
    validateRequiredColumns(columnMapping, headers);
    const data = rows.map(row => {
      const obj = {};
      headers.forEach((header, colIndex) => {
        if (header && header.toString().trim() !== '') {
          const value = row[colIndex];
          obj[header.toString().trim()] = (value !== null && value !== undefined) ? value : '';
        }
      });
      return obj;
    }).filter(obj => Object.keys(obj).length > 0);
    tempFile.setTrashed(true);
    Drive.Files.remove(googleFile.id);
    return { data, columnMapping };
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
}

function validateRequiredColumns(columnMapping, headers) {
  const required = ['claimId', 'employeeCode', 'category', 'disease', 'claimedAmount', 'paidAmount', 'totalAmount'];
  const missing = [];
  for (const col of required) {
    if (!columnMapping[col]) missing.push(col);
  }
  if (missing.length > 0) throw new Error(`Missing required columns: ${missing.join(', ')}`);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function cleanupAllTempFiles() {
  const folderName = 'ClaimsDashboard_Temp';
  const folders = DriveApp.getFoldersByName(folderName);
  let deleted = 0;
  while (folders.hasNext()) {
    const folder = folders.next();
    const files = folder.getFiles();
    while (files.hasNext()) {
      files.next().setTrashed(true);
      deleted++;
    }
  }
  Logger.log('Deleted ' + deleted + ' temp files');
}
