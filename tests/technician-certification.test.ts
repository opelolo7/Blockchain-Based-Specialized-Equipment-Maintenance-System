import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity VM interactions
const mockVM = {
  certifications: new Map(),
  authorizedIssuers: new Map(),
  contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  txSender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  
  initialize() {
    this.authorizedIssuers.set(this.contractOwner, { 'is-authorized': true });
  },
  
  addAuthorizedIssuer(issuer) {
    if (this.txSender !== this.contractOwner) {
      return { result: { error: 1 } };
    }
    
    this.authorizedIssuers.set(issuer, { 'is-authorized': true });
    return { result: { value: true } };
  },
  
  issueCertification(technician, equipmentType, certificationDate, expirationDate, certificationLevel) {
    const issuerAuth = this.authorizedIssuers.get(this.txSender);
    if (!issuerAuth || !issuerAuth['is-authorized']) {
      return { result: { error: 1 } };
    }
    
    if (certificationDate >= expirationDate) {
      return { result: { error: 2 } };
    }
    
    const key = `${technician}-${equipmentType}`;
    this.certifications.set(key, {
      'certification-date': certificationDate,
      'expiration-date': expirationDate,
      'certification-level': certificationLevel,
      issuer: this.txSender,
      'is-active': true
    });
    
    return { result: { value: true } };
  },
  
  isCertified(technician, equipmentType, currentTime) {
    const key = `${technician}-${equipmentType}`;
    const cert = this.certifications.get(key);
    
    if (!cert) {
      return { result: { value: false } };
    }
    
    const isValid = cert['is-active'] && cert['expiration-date'] >= currentTime;
    return { result: { value: isValid } };
  },
  
  revokeCertification(technician, equipmentType) {
    const issuerAuth = this.authorizedIssuers.get(this.txSender);
    if (!issuerAuth || !issuerAuth['is-authorized']) {
      return { result: { error: 1 } };
    }
    
    const key = `${technician}-${equipmentType}`;
    const cert = this.certifications.get(key);
    
    if (!cert) {
      return { result: { error: 2 } };
    }
    
    cert['is-active'] = false;
    this.certifications.set(key, cert);
    
    return { result: { value: true } };
  },
  
  setTxSender(address) {
    this.txSender = address;
  }
};

describe('Technician Certification Contract', () => {
  beforeEach(() => {
    // Reset the mock VM state
    mockVM.certifications = new Map();
    mockVM.authorizedIssuers = new Map();
    mockVM.txSender = mockVM.contractOwner;
    mockVM.initialize();
  });
  
  it('should issue a certification', () => {
    const technician = 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGN';
    const equipmentType = 'Industrial Pump XP-5000';
    const certificationDate = 1612137600; // Feb 1, 2021
    const expirationDate = 1738368000;    // Feb 1, 2025
    const certificationLevel = 3;
    
    const result = mockVM.issueCertification(
        technician,
        equipmentType,
        certificationDate,
        expirationDate,
        certificationLevel
    );
    
    expect(result.result.value).toBe(true);
    
    // Verify certification is valid
    const isValid = mockVM.isCertified(technician, equipmentType, 1612137601).result.value;
    expect(isValid).toBe(true);
  });
  
  it('should fail to issue certification with invalid dates', () => {
    const technician = 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGN';
    const equipmentType = 'Industrial Pump XP-5000';
    const certificationDate = 1612137600; // Feb 1, 2021
    const expirationDate = 1612137600;    // Same date (invalid)
    const certificationLevel = 3;
    
    const result = mockVM.issueCertification(
        technician,
        equipmentType,
        certificationDate,
        expirationDate,
        certificationLevel
    );
    
    expect(result.result.error).toBe(2); // Invalid dates error
  });
  
  it('should revoke a certification', () => {
    // First issue a certification
    const technician = 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGN';
    const equipmentType = 'Industrial Pump XP-5000';
    mockVM.issueCertification(
        technician,
        equipmentType,
        1612137600, // Feb 1, 2021
        1738368000, // Feb 1, 2025
        3
    );
    
    // Revoke it
    const result = mockVM.revokeCertification(technician, equipmentType);
    expect(result.result.value).toBe(true);
    
    // Verify certification is no longer valid
    const isValid = mockVM.isCertified(technician, equipmentType, 1612137601).result.value;
    expect(isValid).toBe(false);
  });
  
  it('should fail to issue certification if not authorized', () => {
    // Change tx-sender to unauthorized user
    mockVM.setTxSender('ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGO');
    
    const technician = 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGN';
    const equipmentType = 'Industrial Pump XP-5000';
    
    const result = mockVM.issueCertification(
        technician,
        equipmentType,
        1612137600,
        1738368000,
        3
    );
    
    expect(result.result.error).toBe(1); // Not authorized error
  });
});
