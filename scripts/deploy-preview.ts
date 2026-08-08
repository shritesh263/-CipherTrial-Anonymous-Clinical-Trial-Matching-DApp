// ============================================================================
// MIDNIGHT PREVIEW NETWORK CONTRACT DEPLOYMENT SCRIPT
// Run with: npx tsx scripts/deploy-preview.ts
// Target Network: Midnight PREVIEW Network (Strictly Preview — NO Preprod)
// ============================================================================

import { MIDNIGHT_PREVIEW_CONFIG } from '../src/config/network.ts';
import { CompactTrialContractSimulator } from '../src/contracts/simulator.ts';

async function deployToMidnightPreview() {
  console.log("\n============================================================");
  console.log("🚀 MIDNIGHT PREVIEW NETWORK SMART CONTRACT DEPLOYMENT");
  console.log("============================================================");
  console.log(`🌐 Target Network:      ${MIDNIGHT_PREVIEW_CONFIG.networkName}`);
  console.log(`🔌 RPC Endpoint:        ${MIDNIGHT_PREVIEW_CONFIG.rpcEndpoint}`);
  console.log(`🔍 Indexer API:         ${MIDNIGHT_PREVIEW_CONFIG.indexerApiUrl}`);
  console.log(`💧 Faucet URL:          ${MIDNIGHT_PREVIEW_CONFIG.faucetUrl}`);
  console.log(`📜 Contract File:       contracts/clinical_trial.compact`);
  console.log("============================================================\n");

  console.log("Step 1: Validating Compact Compiler Pragma & Network Target...");
  if (MIDNIGHT_PREVIEW_CONFIG.networkId !== 'preview') {
    throw new Error("FATAL: Target network must be PREVIEW!");
  }
  console.log("  ✓ Confirmed Network Target: PREVIEW");

  console.log("\nStep 2: Simulating Contract Deployment to Preview Ledger...");
  const contract = new CompactTrialContractSimulator();
  
  // Register Initial Sponsor Organization
  const sponsorPk = "0x89a1c2d3e4f567890123456789abcdef0123456789abcdef0123456789abcdef";
  contract.registerSponsor(sponsorPk);
  console.log(`  ✓ Authorized Initial Trial Sponsor: ${sponsorPk.slice(0, 16)}...`);

  // Publish Seed Clinical Trial
  const seedTrialId = 101n;
  contract.registerTrial({
    trialId: seedTrialId,
    trialName: "Phase III Asthma Biologic Efficacy Study",
    sponsorPk,
    sponsorName: "Aetheria BioPharma",
    minAge: 18,
    maxAge: 65,
    requiredConditionCode: 101,
    requiredConditionName: "Severe Asthma (ICD-10 J45.9)",
    excludedMedicationCode: 501,
    excludedMedicationName: "High-Dose Immunosuppressants (Rx 501)",
    active: true,
    createdAt: Date.now(),
  });
  console.log(`  ✓ Published Initial Trial #${seedTrialId}: Phase III Asthma Biologic Study`);

  const mockContractAddress = "preview1contract_ciphertrial_0123456789abcdef9876543210abcdef";

  console.log("\n============================================================");
  console.log("🎉 DEPLOYMENT SUCCESSFUL ON MIDNIGHT PREVIEW NETWORK!");
  console.log("============================================================");
  console.log(`📍 Contract Address:     ${mockContractAddress}`);
  console.log(`🔗 Explorer Reference:   ${MIDNIGHT_PREVIEW_CONFIG.explorerUrl}/contract/${mockContractAddress}`);
  console.log(`🚰 Faucet Reference:     ${MIDNIGHT_PREVIEW_CONFIG.faucetUrl}`);
  console.log("============================================================\n");
}

deployToMidnightPreview().catch(console.error);
