import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProofAnchorModule", (m) => {
  const proofAnchor = m.contract("ProofAnchor");

  return { proofAnchor };
});