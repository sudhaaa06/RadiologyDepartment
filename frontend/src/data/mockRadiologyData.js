// Comprehensive clinical mock dataset for PRIORIQ Prior-Study Matching Assistant
// Strictly non-diagnostic: structured representations of historical records

export const MOCK_PATIENT_CASES = [
  {
    id: 'case-1',
    patientId: 'PT-20481',
    patientName: 'Vance, Sarah L.',
    age: 52,
    sex: 'Female',
    dob: '1974-06-18',
    room: 'OPD-Rad-2B',
    accession: 'ACC-2026-882194',
    orderingPhysician: 'Dr. Marcus Finch, MD (Pulmonary Medicine)',
    facility: 'Memorial General Hospital - Main Pavilion',
    status: 'Ready for Review',
    priority: 'Routine Prior Review',
    currentStudy: {
      studyId: 'ST-2026-0324-CT',
      name: 'CT CHEST',
      modality: 'CT',
      anatomy: 'Chest / Thorax',
      subRegion: 'Right Upper Lobe Subsegmental',
      dateTime: '2026-03-24 14:15 EST',
      contrast: 'IV Contrast: Isovue 370 (85 mL @ 3.0 mL/s, Venous Phase)',
      indication: 'Surveillance of 8.4mm right upper lobe subsolid pulmonary nodule; history of stage IA adenocarcinoma s/p segmentectomy (2022); evaluate for interval morphological progression vs post-surgical scarring.',
      protocol: 'Thorax Helical 1.0mm axial slices, B60f sharp lung / B30f smooth mediastinal kernels',
      scanner: 'Siemens SOMATOM Force (Dual Source 128)',
      kvp: 120,
      mas: 180,
      totalSlices: 96,
      currentSlice: 52,
      radiationDose: 'CTDIvol: 6.8 mGy | DLP: 245 mGy*cm',
      keyFindingsPlaceholder: 'Solitary part-solid opacity centered in posterior segment of RUL (Slice 52), abutting visceral pleura without gross pleural retraction.',
      lesionMeasurement: {
        location: 'Right Upper Lobe (Posterior Segment)',
        longestDiameter: '8.4 mm',
        shortDiameter: '6.9 mm',
        solidComponent: '4.2 mm',
        densityHU: '-138 HU (part-solid component: +28 HU)',
        sliceIndex: 52
      }
    },
    priorStudies: [
      {
        id: 'prior-101',
        rank: 1,
        studyName: 'CT Chest with IV Contrast',
        shortName: 'CT Chest',
        date: '2025-06-18 10:20 EST',
        year: '2025',
        interval: '9 months prior',
        institution: 'Memorial General Hospital - Main Pavilion',
        accession: 'ACC-2025-419082',
        matchScore: 92,
        confidence: 'High',
        confidenceRationale: 'Identical protocol & IV phase with explicit lexical co-occurrence of RUL subsolid nodule.',
        status: 'Unconfirmed',
        scores: {
          anatomy: 98,
          modality: 99,
          condition: 92,
          reportContext: 91,
          temporal: 90
        },
        evidence: {
          sameAnatomy: 'Complete lung parenchyma matched from apical pleura to bilateral costophrenic recesses (98% volumetric overlap).',
          sameModality: 'Helical CT with identical 1.0mm thin-slice reconstructed volume and matched venous phase IV contrast timing.',
          similarIndication: 'Previous order requested "Chest CT follow-up for right upper lobe nodule stability post-segmentectomy".',
          reportTerminology: 'Shared key radiological concepts: "Right upper lobe", "part-solid nodule", "pleural abutment", "no adenopathy".',
          previousCondition: 'Explicitly documented RUL nodule measuring 7.8 mm x 6.5 mm on axial series 4, slice #54.',
          timeRelevance: '9-month comparative baseline adheres precisely to Fleischner Society nodule surveillance recommendations.'
        },
        reportExcerpt: {
          title: 'IMPRESSION - CT CHEST (2025-06-18)',
          text: 'Persistent subsolid nodule in the right upper lobe posterior segment measuring 7.8 x 6.5 mm (previously 6.2 mm in May 2024). A 3.1 mm eccentric solid core is noted. No mediastinal or hilar lymphadenopathy. No pleural effusion. Recommend follow-up in 9-12 months.'
        },
        documentedMeasurements: {
          dimension: '7.8 mm x 6.5 mm',
          solidCore: '3.1 mm',
          densityHU: '-142 HU',
          slice: 54
        }
      },
      {
        id: 'prior-102',
        rank: 2,
        studyName: 'CT Chest without Contrast (Low-Dose)',
        shortName: 'CT Chest',
        date: '2024-05-12 09:15 EST',
        year: '2024',
        interval: '22 months prior',
        institution: 'St. Jude Regional Imaging Center',
        accession: 'ACC-2024-190411',
        matchScore: 87,
        confidence: 'High',
        confidenceRationale: 'Good anatomical concordance, provides historical baseline for RUL subsolid lesion.',
        status: 'Available',
        scores: {
          anatomy: 95,
          modality: 85,
          condition: 88,
          reportContext: 86,
          temporal: 78
        },
        evidence: {
          sameAnatomy: 'Full thoracic coverage; both lung fields well aerated and visualized.',
          sameModality: 'Helical CT without IV contrast (Low-Dose Screening Protocol, 2.0mm slice thickness).',
          similarIndication: 'Routine annual cancer surveillance following wedge resection.',
          reportTerminology: 'Mention of "ground-glass opacity in right apex", "surgical staples in place", "clear lung bases".',
          previousCondition: 'Faint 6.2 mm subsolid nodule first recognized as non-resolving.',
          timeRelevance: '22-month interval useful for determining long-term doubling time and baseline growth velocity.'
        },
        reportExcerpt: {
          title: 'IMPRESSION - CT CHEST LOW DOSE (2024-05-12)',
          text: 'Faint non-calcified subsolid opacity in the right upper lung zone measuring approximately 6.2 mm. Stable surgical changes of right-sided wedge resection. No acute airspace disease.'
        },
        documentedMeasurements: {
          dimension: '6.2 mm x 5.8 mm',
          solidCore: '1.2 mm',
          densityHU: '-185 HU',
          slice: 48
        }
      },
      {
        id: 'prior-103',
        rank: 3,
        studyName: 'X-Ray Chest PA & Lateral (2 Views)',
        shortName: 'X-Ray Chest',
        date: '2023-11-04 16:30 EST',
        year: '2023',
        interval: '28 months prior',
        institution: 'Memorial General Hospital - Outpatient Clinic',
        accession: 'ACC-2023-882049',
        matchScore: 61,
        confidence: 'Moderate',
        confidenceRationale: 'Modality disparity: 2D projection radiography vs 3D CT, but historical post-op reference.',
        status: 'Available',
        scores: {
          anatomy: 88,
          modality: 45,
          condition: 68,
          reportContext: 56,
          temporal: 58
        },
        evidence: {
          sameAnatomy: '2-view projection chest radiograph covering heart, lungs, and mediastinum.',
          sameModality: 'Modality mismatch: Plain film radiography vs cross-sectional CT.',
          similarIndication: 'Post-operative cough and dyspnea evaluation.',
          reportTerminology: 'General terms: "surgical clips right hemithorax", "lungs clear", "no pneumothorax".',
          previousCondition: 'Sub-centimeter RUL nodule was not reliably discernible on plain projection film.',
          timeRelevance: '28-month historical reference only; insufficient sensitivity for nodule tracking.'
        },
        reportExcerpt: {
          title: 'IMPRESSION - XR CHEST (2023-11-04)',
          text: 'Post-operative changes in right upper thorax with surgical clips. Lungs appear clear without consolidation or effusion. Cardiomediastinal silhouette normal.'
        },
        documentedMeasurements: {
          dimension: 'Unresolved on 2D XR',
          solidCore: 'N/A',
          densityHU: 'N/A',
          slice: 'Projection'
        }
      }
    ],
    changeOverTime: {
      targetFinding: 'Right Upper Lobe Subsolid Nodule (Segment 2)',
      timelinePoints: [
        { year: '2023', study: 'X-Ray Chest', sizeMm: null, displaySize: 'Obscured (XR)', solidMm: null, mentions: 1, term: 'Post-op surgical clips' },
        { year: '2024', study: 'CT Chest', sizeMm: 6.2, displaySize: '6.2 mm', solidMm: 1.2, mentions: 4, term: 'Subsolid ground-glass opacity' },
        { year: '2025', study: 'CT Chest', sizeMm: 7.8, displaySize: '7.8 mm', solidMm: 3.1, mentions: 7, term: 'Part-solid nodule with solid core' },
        { year: '2026', study: 'Current CT', sizeMm: 8.4, displaySize: '8.4 mm', solidMm: 4.2, mentions: 9, term: 'Progressive solid component (Current)' }
      ],
      morphologyProgression: [
        { label: 'Documented Nodule Size', value: '6.2 mm (2024) → 7.8 mm (2025) → 8.4 mm (Current CT)' },
        { label: 'Solid Core Dimension', value: '1.2 mm (2024) → 3.1 mm (2025) → 4.2 mm (Current CT)' },
        { label: 'Mention Frequency', value: 'Cited 1x (2023) → 4x (2024) → 7x (2025) → 9x (2026)' },
        { label: 'Report Terminology Changes', value: '"Faint opacity" (2024) → "Subsolid nodule" (2025) → "Progressive solid core" (2026)' }
      ]
    }
  },
  {
    id: 'case-2',
    patientId: 'PT-39104',
    patientName: 'Castillo, Julian R.',
    age: 42,
    sex: 'Male',
    dob: '1984-07-22',
    room: 'ED-Trauma-Bay-2',
    accession: 'ACC-2026-619280',
    orderingPhysician: 'Dr. Sarah Jenkins, MD (Emergency Medicine)',
    facility: 'Memorial General Hospital - Main Pavilion',
    status: 'Stat Prior Match Required',
    priority: 'Emergency Trauma',
    currentStudy: {
      studyId: 'ST-2026-0324-CS',
      name: 'CT CERVICAL SPINE',
      modality: 'CT',
      anatomy: 'Cervical Spine',
      subRegion: 'C1-T1 with Sagittal/Coronal Reformats',
      dateTime: '2026-03-24 15:40 EST',
      contrast: 'None (Non-contrast Trauma Protocol)',
      indication: 'High-speed motor vehicle collision; midline posterior cervical tenderness; rule out acute osseous fracture, facet subluxation, or traumatic disc disruption.',
      protocol: 'Ultra-thin 0.625mm bone kernel reformats, soft tissue window, 3D volumetric reconstruction',
      scanner: 'GE Revolution Apex 256',
      kvp: 120,
      mas: 240,
      totalSlices: 128,
      currentSlice: 64,
      radiationDose: 'CTDIvol: 18.4 mGy | DLP: 380 mGy*cm',
      keyFindingsPlaceholder: 'Suspected widening of C5-C6 interspinous distance; need immediate comparison to rule out preexisting degenerative spondylolisthesis vs acute injury.',
      lesionMeasurement: {
        location: 'C5-C6 Interspace',
        longestDiameter: '3.4 mm interspinous gap',
        shortDiameter: '1.5 mm retrolisthesis',
        solidComponent: 'N/A',
        densityHU: 'Osseous margin intact',
        sliceIndex: 64
      }
    },
    priorStudies: [
      {
        id: 'prior-201',
        rank: 1,
        studyName: 'CT Cervical Spine without Contrast',
        shortName: 'CT C-Spine',
        date: '2024-08-14 19:10 EST',
        year: '2024',
        interval: '19 months prior',
        institution: 'Memorial General Hospital - Main Pavilion',
        accession: 'ACC-2024-551920',
        matchScore: 96,
        confidence: 'High',
        confidenceRationale: 'Identical anatomical coverage and modality with documented C5-C6 baseline findings.',
        status: 'Unconfirmed',
        scores: {
          anatomy: 99,
          modality: 99,
          condition: 94,
          reportContext: 95,
          temporal: 89
        },
        evidence: {
          sameAnatomy: 'C0 (Skull base) to T2 vertebral bodies mapped with identical sagittal plane reconstruction.',
          sameModality: 'Thin-slice non-contrast helical CT with matching bone filtration algorithm.',
          similarIndication: 'Workup for neck pain following sports collision.',
          reportTerminology: 'Matching tags: "C5-C6 facet joints", "interspinous spacing", "prevertebral soft tissues normal".',
          previousCondition: 'Documented preexisting 2.8 mm C5-C6 interspinous diastasis and mild degenerative osteophytes.',
          timeRelevance: '19-month prior serves as direct anatomical baseline to confirm chronic vs acute trauma status.'
        },
        reportExcerpt: {
          title: 'IMPRESSION - CT C-SPINE (2024-08-14)',
          text: 'No acute cervical fracture or dislocation. Mild preexisting C5-C6 degenerative disc disease with slight 2.8 mm posterior disc space narrowing and stable mild retrolisthesis.'
        },
        documentedMeasurements: {
          dimension: '2.8 mm interspinous space',
          solidCore: 'Preexisting spondylolisthesis',
          densityHU: 'Normal trabecular density',
          slice: 62
        }
      },
      {
        id: 'prior-202',
        rank: 2,
        studyName: 'MRI Cervical Spine without Contrast',
        shortName: 'MRI C-Spine',
        date: '2022-11-03 14:00 EST',
        year: '2022',
        interval: '40 months prior',
        institution: 'St. Jude Regional Imaging Center',
        accession: 'ACC-2022-819441',
        matchScore: 79,
        confidence: 'Moderate',
        confidenceRationale: 'Provides high ligamentous soft tissue detail but different modality (MRI vs CT).',
        status: 'Available',
        scores: {
          anatomy: 96,
          modality: 65,
          condition: 82,
          reportContext: 80,
          temporal: 68
        },
        evidence: {
          sameAnatomy: 'Craniocervical junction through thoracic inlet.',
          sameModality: 'MRI 1.5T with T1/T2/STIR sequences vs CT Bone reconstruction.',
          similarIndication: 'Chronic radicular arm symptoms.',
          reportTerminology: 'Mentions "ligamentum flavum intact", "C5-C6 disc bulge", "no cord signal abnormality".',
          previousCondition: 'Confirms posterior longitudinal ligament integrity prior to current accident.',
          timeRelevance: 'Older study (3+ years), helpful for soft-tissue baseline confirmation.'
        },
        reportExcerpt: {
          title: 'IMPRESSION - MRI CERVICAL SPINE (2022-11-03)',
          text: 'Mild C5-C6 broad-based posterior disc protrusion without significant canal compromise or cord compression.'
        },
        documentedMeasurements: {
          dimension: '2.5 mm protrusion',
          solidCore: 'No cord signal change',
          densityHU: 'N/A',
          slice: 8
        }
      }
    ],
    changeOverTime: {
      targetFinding: 'C5-C6 Alignment & Interspinous Space',
      timelinePoints: [
        { year: '2022', study: 'MRI C-Spine', sizeMm: 2.5, displaySize: '2.5 mm disc bulge', solidMm: null, mentions: 3, term: 'Degenerative disc protrusion' },
        { year: '2024', study: 'CT C-Spine', sizeMm: 2.8, displaySize: '2.8 mm gap', solidMm: null, mentions: 5, term: 'Preexisting retrolisthesis' },
        { year: '2026', study: 'Current CT', sizeMm: 3.4, displaySize: '3.4 mm gap', solidMm: null, mentions: 6, term: 'Interspinous widening (Current Trauma)' }
      ],
      morphologyProgression: [
        { label: 'Documented Interspinous Space', value: '2.8 mm (2024 CT) → 3.4 mm (Current CT)' },
        { label: 'Retrolisthesis of C5 on C6', value: '1.2 mm (2024 CT) → 1.5 mm (Current CT)' },
        { label: 'Baseline Chronic Status', value: 'Prior report confirms chronic degenerative origin; limits overcalling acute fracture.' }
      ]
    }
  },
  {
    id: 'case-3',
    patientId: 'PT-10942',
    patientName: 'Zhang, Wei',
    age: 29,
    sex: 'Male',
    dob: '1997-05-10',
    room: 'OPD-Rad-1A',
    accession: 'ACC-2026-118491',
    orderingPhysician: 'Dr. Kimberly Adams, MD (Neurology)',
    facility: 'Memorial General Hospital - Main Pavilion',
    status: 'Baseline Scan (No Historical Priors Found)',
    priority: 'Routine Baseline',
    currentStudy: {
      studyId: 'ST-2026-0324-MRI',
      name: 'MRI BRAIN',
      modality: 'MRI',
      anatomy: 'Head / Brain',
      subRegion: 'Cerebrum, Brainstem, Posterior Fossa',
      dateTime: '2026-03-24 11:30 EST',
      contrast: 'IV Contrast: Gadavist 1.0 mmol/mL (7.5 mL standard dosing)',
      indication: 'New onset complex migraine with aura; rule out intracranial mass lesion, arteriovenous malformation, or demyelinating process.',
      protocol: 'Brain 3T high-resolution: T1 3D Volumetric, T2 Axial, FLAIR, DWI/ADC, Post-contrast T1 MP-RAGE',
      scanner: 'Siemens MAGNETOM Vida 3T',
      kvp: 'N/A (3.0 Tesla MR)',
      mas: 'N/A',
      totalSlices: 160,
      currentSlice: 80,
      radiationDose: 'Non-ionizing RF Energy (SAR: 1.4 W/kg)',
      keyFindingsPlaceholder: 'No previous imaging records exist in this enterprise or federated regional PACS archives. Baseline established.',
      lesionMeasurement: {
        location: 'No focal intracranial abnormality',
        longestDiameter: 'Normal',
        shortDiameter: 'Normal',
        solidComponent: 'None',
        densityHU: 'N/A',
        sliceIndex: 80
      }
    },
    priorStudies: [],
    changeOverTime: {
      targetFinding: 'Intracranial Parenchyma (First Examination)',
      timelinePoints: [],
      morphologyProgression: [
        { label: 'Prior Baseline Status', value: 'No prior imaging found across 4 federated health systems (10-year query window).' },
        { label: 'Enterprise Action', value: 'This study will serve as the index baseline study for all future comparisons.' }
      ]
    }
  }
];

export const INITIAL_AUDIT_LOG = [
  {
    id: 'aud-8801',
    timestamp: '16:04:12 EST',
    user: 'Dr. Elena Vance, MD',
    action: 'CONFIRMED_PRIOR',
    caseId: 'case-1',
    patientId: 'PT-20481',
    currentStudyId: 'ST-2026-0324-CT',
    selectedPriorId: 'prior-101',
    priorName: 'CT Chest with IV Contrast (2025)',
    matchScore: 92,
    reason: 'Human confirmed: Optimal protocol, IV contrast phase, and anatomical alignment for RUL nodule surveillance.',
    attestation: 'Physician attests clinical relevance of selected prior study for comparative evaluation.'
  },
  {
    id: 'aud-8794',
    timestamp: '15:22:45 EST',
    user: 'Dr. Elena Vance, MD',
    action: 'OVERRIDE_MATCH',
    caseId: 'case-2',
    patientId: 'PT-39104',
    currentStudyId: 'ST-2026-0324-CS',
    selectedPriorId: 'prior-202',
    priorName: 'MRI Cervical Spine (2022)',
    matchScore: 79,
    reason: 'OVERRIDE_REASON: Wrong modality for acute bone fracture evaluation. CT prior selected instead for trauma alignment comparison.',
    attestation: 'Physician overrode rank #1 in favor of high-yield osseous baseline.'
  }
];

export const SYSTEM_METRICS = {
  activeEngine: 'PRIORIQ Match Engine v4.2.1-clinical',
  pacsConnection: 'ONLINE (DICOM C-FIND / C-MOVE Gateway 10.40.2.15)',
  latencyMs: 14,
  timeToLocateSeconds: 1.8,
  manualSearchBaselineMinutes: 4.2
};
