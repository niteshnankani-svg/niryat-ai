export const GETTING_STARTED_STEPS = [
  {
    step: 1,
    title: 'Get your IEC Code',
    status: 'done',
    description: 'Import Export Code — mandatory to export from India.',
    detail: 'Apply online at dgft.gov.in with PAN, Aadhaar, and a cancelled cheque. Fee is ₹500. Usually issued within 1-2 working days.',
  },
  {
    step: 2,
    title: 'Register on ICEGATE',
    status: 'in-progress',
    description: 'Customs portal for filing shipping bills electronically.',
    detail: 'Create an account at icegate.gov.in linked to your IEC and AD Code. Needed before your first shipment clears customs.',
  },
  {
    step: 3,
    title: 'Prepare export documents',
    status: 'not-started',
    description: 'Commercial invoice, packing list, and certificate of origin.',
    detail: 'See the Documents page for the full checklist — mandatory vs buyer-specific paperwork.',
  },
  {
    step: 4,
    title: 'Choose payment terms',
    status: 'not-started',
    description: 'Advance, Letter of Credit, DP, or DA — pick based on buyer trust.',
    detail: 'New buyers: ask for advance or LC. Established relationships: DP/DA reduce friction but carry more risk.',
  },
  {
    step: 5,
    title: 'Arrange freight & insurance',
    status: 'not-started',
    description: 'Book a forwarder, decide Incoterms, get marine cargo cover.',
    detail: 'FOB shifts freight cost/risk to the buyer; CIF means you arrange and pay for it. Insure high-value cargo.',
  },
  {
    step: 6,
    title: 'Claim export incentives',
    status: 'not-started',
    description: 'RoDTEP, Duty Drawback, and other scheme benefits.',
    detail: 'File claims through ICEGATE after shipment. See Govt Schemes for rates by product category.',
  },
]

export const DOCUMENTS = [
  {
    icon: 'receipt', name: 'Commercial Invoice', description: 'Itemized bill of sale — value, quantity, buyer/seller details.', requirement: 'Mandatory',
    detail: 'The core sales document — lists product description, HS code, quantity, unit price, total value, Incoterm, and buyer/seller details. Customs uses this to assess duty and value your shipment.',
    obtainFrom: 'You create this yourself, on your company letterhead — no government portal involved.',
  },
  {
    icon: 'boxes', name: 'Packing List', description: 'Contents, weight, and dimensions of each package.', requirement: 'Mandatory',
    detail: 'Box-by-box breakdown of what\'s inside each package — net/gross weight, dimensions, and carton count. Customs and the carrier both cross-check this against the invoice.',
    obtainFrom: 'You create this yourself alongside the commercial invoice.',
  },
  {
    icon: 'buyers', name: 'Certificate of Origin', description: 'Confirms goods were manufactured in India — needed for tariff preference.', requirement: 'If buyer asks',
    detail: 'Proves the goods were made in India, which lets the buyer claim a lower import duty under trade agreements (e.g. India-ASEAN, GSP schemes). Not needed unless the buyer\'s country offers such preference.',
    obtainFrom: 'Apply via the Common Digital Platform (coo.dgft.gov.in) or your local Chamber of Commerce.',
  },
  {
    icon: 'ship', name: 'Bill of Lading / Airway Bill', description: 'Proof of shipment issued by the carrier.', requirement: 'Mandatory',
    detail: 'Issued by the shipping line (Bill of Lading) or airline (Airway Bill) once cargo is loaded. It\'s your proof of shipment and, for sea freight, also acts as a title document the buyer needs to collect the goods.',
    obtainFrom: 'Issued automatically by your freight forwarder / shipping line after loading.',
  },
  {
    icon: 'clipboard', name: 'Shipping Bill', description: 'Filed on ICEGATE — customs clearance for export.', requirement: 'Mandatory',
    detail: 'The customs clearance document for export — filed electronically before goods leave India. Required to claim RoDTEP/Drawback benefits later, so file it accurately.',
    obtainFrom: 'File electronically at icegate.gov.in, linked to your IEC and AD Code.',
  },
  {
    icon: 'badgeCheck', name: 'Quality Certificate', description: 'Inspection certificate for regulated goods (food, pharma, etc).', requirement: 'If buyer asks',
    detail: 'Third-party or government inspection confirming the goods meet a stated quality/safety standard. Common for food (FSSAI), pharma, and agricultural exports — some countries mandate it at customs on arrival.',
    obtainFrom: 'APEDA-approved labs for agri/food; sector-specific inspection agencies otherwise.',
  },
]

export const PAYMENT_METHODS = [
  {
    name: 'Advance Payment (T/T)', description: 'Buyer pays before goods ship.', risk: 'Safest', speed: 'Fast', cost: 'Low (wire fee only)',
    whenToUse: 'New buyers with no trading history, small first orders, or high-risk destination countries.',
    howItWorks: ['Buyer wires full (or partial) payment via SWIFT before you manufacture/ship', 'You confirm funds received in your bank account', 'Goods are shipped only after payment clears', 'No bank guarantee needed — the buyer is trusting you'],
  },
  {
    name: 'Letter of Credit (LC)', description: 'Bank guarantees payment on presenting compliant documents.', risk: 'Very safe', speed: 'Medium', cost: 'Medium (bank charges)',
    whenToUse: 'Medium-to-large orders, unfamiliar buyers, or when the buyer\'s bank is willing to issue one — the standard for higher-value first-time trade.',
    howItWorks: ['Buyer\'s bank issues an LC in your favor, routed via your bank', 'You ship the goods and prepare exact documents matching the LC terms', 'Your bank verifies documents and forwards them to the buyer\'s bank', 'Payment is released once documents are found fully compliant'],
  },
  {
    name: 'Documents against Payment (DP)', description: 'Buyer pays when documents are released by their bank.', risk: 'Medium', speed: 'Medium', cost: 'Low',
    whenToUse: 'Established buyers with a decent trust level, where a full LC feels like overkill but you still want a bank in the loop.',
    howItWorks: ['You ship goods and hand shipping documents to your bank', 'Your bank forwards documents to the buyer\'s bank (collection)', 'Buyer\'s bank releases documents only after the buyer pays', 'Buyer needs the documents to clear customs and collect the goods'],
  },
  {
    name: 'Documents against Acceptance (DA)', description: 'Buyer accepts a bill of exchange, pays later.', risk: 'Risky', speed: 'Slow', cost: 'Low',
    whenToUse: 'Long-term buyers you trust, or when the buyer needs short-term credit to move your goods — common in repeat relationships.',
    howItWorks: ['You ship goods and route documents through banks, same as DP', 'Buyer\'s bank releases documents once buyer signs (accepts) a bill of exchange', 'Buyer gets the goods immediately but pays only at a later fixed date', 'You carry the credit risk until that date — no bank guarantee'],
  },
  {
    name: 'Open Account', description: 'Goods ship first, payment due on agreed terms later.', risk: 'Risky', speed: 'Fast', cost: 'Low',
    whenToUse: 'Long-standing buyers with a strong payment history, often paired with export credit insurance (ECGC) to cover the risk.',
    howItWorks: ['You ship goods and send documents directly to the buyer — no bank involved', 'Buyer takes possession and clears customs immediately', 'Payment is due per agreed terms (e.g. net 30/60/90 days)', 'Entirely trust-based — consider ECGC cover for protection'],
  },
]

export const COSTING_ROWS = [
  { label: 'Ex-factory price', amount: 100000 },
  { label: 'Inland transport to port', amount: 3500 },
  { label: 'Export packing', amount: 2000 },
  { label: 'Documentation & customs', amount: 1500 },
  { label: 'FOB price', amount: 107000, subtotal: true },
  { label: 'Ocean freight', amount: 8500 },
  { label: 'Marine insurance', amount: 1200 },
  { label: 'Final CIF price to buyer', amount: 116700, total: true },
]

export const GOVT_SCHEMES = [
  {
    icon: 'banknote', name: 'RoDTEP', benefit: '0.5% – 4.3% of FOB value',
    description: 'Remission of Duties and Taxes on Exported Products — refunds embedded taxes not covered by other schemes.',
    eligibility: 'All exporters of manufactured/merchandise goods, except a short exclusion list (SEZ/EOU restrictions, gold, some steel items). Rate depends on your product\'s HS code.',
    howToApply: ['File your Shipping Bill on ICEGATE with the RoDTEP declaration ticked', 'Rate is auto-computed by the system per HS code', 'Credit is issued as a transferable duty-credit scrip (e-scrip) in your ICEGATE ledger', 'Use the scrip to pay future customs duty, or sell/transfer it'],
  },
  {
    icon: 'undo', name: 'Duty Drawback', benefit: 'Up to 1.5% of FOB value',
    description: 'Refund of customs duty paid on imported inputs used in exported goods.',
    eligibility: 'Exporters who used imported (duty-paid) raw materials or components in the exported product.',
    howToApply: ['Declare the Drawback serial number on your Shipping Bill', 'Customs verifies input-output norms for your product', 'Refund is credited directly to your registered bank account', 'Typically processed within a few weeks of shipment'],
  },
  {
    icon: 'trendingDown', name: 'Interest Equalisation Scheme', benefit: '2% – 3% rate subvention',
    description: 'Reduces interest cost on pre/post-shipment export credit for MSMEs and select sectors.',
    eligibility: 'MSME manufacturer-exporters and merchant exporters in ~410 identified tariff lines, on rupee export credit from a scheduled bank.',
    howToApply: ['Apply through your existing working-capital bank, not a government portal', 'Bank applies the interest subvention directly to your export credit account', 'Renew eligibility each financial year per RBI/DGFT circulars'],
  },
  {
    icon: 'shield', name: 'ECGC Insurance', benefit: 'Covers up to 90% of loss',
    description: 'Export Credit Guarantee Corporation cover against buyer default or political risk.',
    eligibility: 'Any exporter shipping on credit terms (DP/DA/Open Account) who wants cover against non-payment by the overseas buyer.',
    howToApply: ['Register and apply for a policy at ecgc.in', 'Declare your shipments/turnover under the policy each month', 'Pay the premium (varies by buyer country risk and credit period)', 'File a claim with shipment/invoice proof if the buyer defaults'],
  },
  {
    icon: 'target', name: 'MAI / MDA Grants', benefit: 'Partial reimbursement of costs',
    description: 'Market Access Initiative / Market Development Assistance — subsidizes trade fair and market research costs.',
    eligibility: 'Export Promotion Councils, trade bodies, and individual exporters (mainly MSMEs) participating in approved trade fairs or market studies abroad.',
    howToApply: ['Check the approved activity/fair list on commerce.gov.in', 'Apply through your Export Promotion Council before the event', 'Submit expense proof (travel, stall, marketing) after participation', 'Reimbursement is partial and capped per scheme guidelines'],
  },
]
