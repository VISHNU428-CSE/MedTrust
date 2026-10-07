export interface RecordTemplate {
  title: string;
  recordType: 'diagnostic_report' | 'lab_result' | 'prescription' | 'radiology_scan' | 'discharge_summary' | 'cardiology_ecg' | 'clinical_notes';
  facility: string;
  doctorAuthor: string;
  diagnosis: string;
  clinicalNotes: string;
  structuredData: Record<string, string | number>;
}

export const SAMPLE_RECORD_TEMPLATES: RecordTemplate[] = [
  {
    title: 'Holter 24-Hour Ambulatory ECG Monitoring',
    recordType: 'cardiology_ecg',
    facility: 'Metro General Heart Institute',
    doctorAuthor: 'Dr. Alexander Vance, MD',
    diagnosis: 'Normal Sinus Rhythm, Occasional Benign Premature Atrial Contractions (PACs)',
    clinicalNotes: 'Total heart beats recorded: 104,210. Mean heart rate 72 bpm (min 52 bpm nocturnal, max 128 bpm during exercise). No sustained supraventricular tachycardia or ventricular arrhythmias. ST segments unremarkable.',
    structuredData: {
      totalBeats: '104,210',
      meanHeartRate: '72 bpm',
      minHeartRate: '52 bpm',
      maxHeartRate: '128 bpm',
      pacCount: '14',
      pvcCount: '2',
      stDeviation: '0.0 mm'
    }
  },
  {
    title: 'Pulmonary Function & Spirometry Test (PFT)',
    recordType: 'diagnostic_report',
    facility: 'Stanford Health Respiratory Center',
    doctorAuthor: 'Dr. Elena Rostova, MD',
    diagnosis: 'Mild Exercise-Induced Bronchospasm, Preserved Lung Volumes',
    clinicalNotes: 'Pre-bronchodilator FEV1 92% of predicted value, FVC 96% of predicted. FEV1/FVC ratio 0.81. Post-albuterol challenge shows 14% improvement in FEV1 confirming reversible airway hyper-reactivity.',
    structuredData: {
      fev1Predicted: '3.40 L',
      fev1Actual: '3.12 L (92%)',
      fvcActual: '3.85 L (96%)',
      fev1FvcRatio: '0.81',
      postDilatorChange: '+14%'
    }
  },
  {
    title: 'Comprehensive Thyroid & Endocrine Panel',
    recordType: 'lab_result',
    facility: 'Labcorp Regional Clinical Testing',
    doctorAuthor: 'Dr. Alexander Vance, MD',
    diagnosis: 'Euthyroid State (Normal Thyroid Axis)',
    clinicalNotes: 'Serum TSH 1.84 uIU/mL (Reference: 0.45 - 4.50 uIU/mL). Free T4 1.22 ng/dL (Reference: 0.82 - 1.77 ng/dL). Thyroid Peroxidase (TPO) antibodies negative (<9 IU/mL).',
    structuredData: {
      tsh: '1.84 uIU/mL',
      freeT4: '1.22 ng/dL',
      freeT3: '3.1 pg/mL',
      tpoAntibodies: '<9 IU/mL (Negative)'
    }
  },
  {
    title: 'Lumbar Spine Multi-Slice CT Scan (L1-S1)',
    recordType: 'radiology_scan',
    facility: 'Mayo Clinic Advanced Imaging',
    doctorAuthor: 'Dr. Marcus Thorne, MD',
    diagnosis: 'Mild L4-L5 Disc Desiccation with Minimal Bulge, No Canal Stenosis',
    clinicalNotes: 'Axial and sagittal CT reconstructions. Vertebral body heights and alignment are preserved. Mild disc height loss at L4-L5 with broad-based 1.5mm bulge without significant neural foraminal narrowing.',
    structuredData: {
      spinalCanal: 'Widely Patent (15mm AP)',
      discDegeneration: 'Grade 1 (Mild)',
      foraminalPatency: 'Bilateral Intact',
      boneMineralization: 'Normal for Age'
    }
  },
  {
    title: 'Specialist Post-Consultation Clinical Summary',
    recordType: 'clinical_notes',
    facility: 'Stanford Health Care',
    doctorAuthor: 'Dr. Elena Rostova, MD, PhD',
    diagnosis: 'Migraine without Aura, Tension Component Controlled with Hydration & Magnesium',
    clinicalNotes: 'Patient reports 70% decrease in headache episodes following regular sleep hygiene and magnesium glycinate supplementation. Neurological cranial nerve exam intact (CN II-XII).',
    structuredData: {
      headacheFrequency: '1 per month (Down from 4)',
      neurologicalExam: 'Grossly Normal',
      treatmentPlan: 'Conservative lifestyle + Magnesium 400mg'
    }
  }
];

export const GLOSSARY_TERMS: Array<{ term: string; category: string; hint: string }> = [
  { term: 'Sinus Bradycardia', category: 'Cardiology', hint: 'Resting heart rate below 60 bpm, common in athletic individuals.' },
  { term: 'eGFR (Glomerular Filtration Rate)', category: 'Renal', hint: 'The gold standard test measuring how efficiently kidneys filter waste from blood.' },
  { term: 'HbA1c (Glycated Hemoglobin)', category: 'Metabolic', hint: 'Measures your average blood sugar level over the past 2 to 3 months.' },
  { term: 'Gadolinium Contrast', category: 'Radiology', hint: 'A magnetic resonance dye used to illuminate blood vessels and tissues in MRI scans.' },
  { term: 'IPFS Content Identifier (CID)', category: 'Decentralized Storage', hint: 'A unique cryptographic fingerprint of the file based on its actual content.' },
  { term: 'Hyperledger Fabric Chaincode', category: 'Smart Contracts', hint: 'Business logic executed across peer nodes to enforce consent rules immutably.' },
  { term: 'Membership Service Provider (MSP)', category: 'Security & Auth', hint: 'Manages cryptographic identities, digital certificates, and permissions in Fabric.' },
  { term: 'Merkle Root', category: 'Blockchain Cryptography', hint: 'A single top-level cryptographic hash summarizing all transactions inside a block.' }
];

export interface SamplePhotoReport {
  id: string;
  name: string;
  category: string;
  photoUrl: string;
  fileName: string;
  fileSize: string;
  title: string;
  recordType: 'diagnostic_report' | 'lab_result' | 'prescription' | 'radiology_scan' | 'discharge_summary' | 'cardiology_ecg' | 'clinical_notes';
  facility: string;
  doctorAuthor: string;
  diagnosis: string;
  clinicalNotes: string;
  structuredData: Record<string, string | number>;
}

export const SAMPLE_PHOTO_REPORTS: SamplePhotoReport[] = [
  {
    id: 'photo-ecg',
    name: '12-Lead ECG Rhythm Strip Scan',
    category: 'Cardiology',
    photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
    fileName: 'metro_cardio_ecg_scan_2026.jpg',
    fileSize: '3.4 MB',
    title: 'Hospital 12-Lead Electrocardiogram Trace Photo',
    recordType: 'cardiology_ecg',
    facility: 'Metro General Heart Center',
    doctorAuthor: 'Dr. Alexander Vance, MD',
    diagnosis: 'Normal Sinus Rhythm with Physiological Bradycardia (56 bpm)',
    clinicalNotes: 'Physician photo scan of paper telemetry strip. PR interval 162 ms, QRS duration 88 ms, QTc 410 ms. ST segments isoelectric across precordial leads V1-V6. No evidence of acute ischemic changes or repolarization abnormalities.',
    structuredData: {
      heartRate: '56 bpm',
      prInterval: '162 ms',
      qrsDuration: '88 ms',
      qtcInterval: '410 ms',
      rhythmStatus: 'Normal Sinus'
    }
  },
  {
    id: 'photo-cbc',
    name: 'Complete Blood Count (CBC) Lab Sheet',
    category: 'Laboratory',
    photoUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&auto=format&fit=crop&q=80',
    fileName: 'labcorp_blood_panel_photo.png',
    fileSize: '2.8 MB',
    title: 'Complete Blood Count (CBC) Differential Panel Scan',
    recordType: 'lab_result',
    facility: 'Labcorp Regional Clinical Testing',
    doctorAuthor: 'Dr. Alexander Vance, MD',
    diagnosis: 'Normocytic Normochromic Red Cells, Normal Leukocyte Differential',
    clinicalNotes: 'Photographed clinical laboratory report form. White Blood Cells 6.4 x10^3/uL, Hemoglobin 14.8 g/dL, Hematocrit 44.2%, Platelet count 248 x10^3/uL. All parameters within target standard reference intervals.',
    structuredData: {
      wbcCount: '6.4 x10^3/uL',
      hemoglobin: '14.8 g/dL',
      hematocrit: '44.2%',
      platelets: '248 x10^3/uL',
      rbcCount: '4.92 x10^6/uL'
    }
  },
  {
    id: 'photo-xray',
    name: 'Chest X-Ray Diagnostic Radiology Scan',
    category: 'Radiology',
    photoUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&auto=format&fit=crop&q=80',
    fileName: 'chest_pa_lateral_radiograph.jpg',
    fileSize: '4.6 MB',
    title: 'Digital Posteroanterior Chest Radiograph Photo',
    recordType: 'radiology_scan',
    facility: 'Stanford Advanced Diagnostic Imaging',
    doctorAuthor: 'Dr. Elena Rostova, MD',
    diagnosis: 'Clear Lung Parenchyma, Unremarkable Cardiothoracic Ratio',
    clinicalNotes: 'Digital photo capture of illuminated lightbox radiograph. Lungs are clear without focal consolidation, pneumothorax, or pleural effusion. Cardiomediastinal silhouette is normal. Costophrenic sulci sharp bilaterally.',
    structuredData: {
      lungFields: 'Clear Bilaterally',
      cardiothoracicRatio: '< 0.50 (Normal)',
      pleuralEffusion: 'None Detected',
      pneumothorax: 'Negative'
    }
  },
  {
    id: 'photo-rx',
    name: 'Physician Prescription Slip & Dosing Plan',
    category: 'Prescription',
    photoUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=900&auto=format&fit=crop&q=80',
    fileName: 'prescribing_doctor_slip_scan.jpg',
    fileSize: '1.9 MB',
    title: 'Clinical Consultation Prescription & Discharge Slip Photo',
    recordType: 'prescription',
    facility: 'Mayo Clinic Health System',
    doctorAuthor: 'Dr. Marcus Thorne, MD',
    diagnosis: 'Post-Exertional Lumbar Myofascial Strain',
    clinicalNotes: 'Photo of handwritten and stamped prescription form. Prescribed: Meloxicam 15mg PO daily with food for 10 days; Cyclobenzaprine 5mg PO at bedtime PRN muscle spasm. Physical therapy referral initiated.',
    structuredData: {
      primaryMedication: 'Meloxicam 15mg Tablet',
      secondaryMedication: 'Cyclobenzaprine 5mg Tablet',
      dosingFrequency: 'Once Daily (Meloxicam)',
      courseDuration: '10 Days',
      refillsRemaining: '0 (One-time acute course)'
    }
  }
];

