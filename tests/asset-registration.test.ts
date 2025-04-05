import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity VM interactions
const mockVM = {
  assets: new Map(),
  lastAssetId: 0,
  txSender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Example address
  
  registerAsset(name, model, serialNumber, manufacturer, installationDate, warrantyExpiration) {
    this.lastAssetId++;
    const newAsset = {
      name,
      model,
      'serial-number': serialNumber,
      manufacturer,
      'installation-date': installationDate,
      'warranty-expiration': warrantyExpiration,
      owner: this.txSender
    };
    this.assets.set(this.lastAssetId, newAsset);
    return { result: { value: this.lastAssetId } };
  },
  
  getAsset(assetId) {
    const asset = this.assets.get(assetId);
    return asset ? { result: { value: asset } } : { result: { value: null } };
  },
  
  transferAsset(assetId, newOwner) {
    const asset = this.assets.get(assetId);
    if (!asset) {
      return { result: { error: 1 } };
    }
    if (asset.owner !== this.txSender) {
      return { result: { error: 2 } };
    }
    
    asset.owner = newOwner;
    this.assets.set(assetId, asset);
    return { result: { value: true } };
  },
  
  setTxSender(address) {
    this.txSender = address;
  }
};

describe('Asset Registration Contract', () => {
  beforeEach(() => {
    // Reset the mock VM state
    mockVM.assets = new Map();
    mockVM.lastAssetId = 0;
    mockVM.txSender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  });
  
  it('should register a new asset', () => {
    const result = mockVM.registerAsset(
        'Industrial Pump',
        'XP-5000',
        'SN12345',
        'PumpCo',
        1612137600, // Feb 1, 2021
        1738368000  // Feb 1, 2025
    );
    
    expect(result.result.value).toBe(1);
    
    const asset = mockVM.getAsset(1).result.value;
    expect(asset.name).toBe('Industrial Pump');
    expect(asset.model).toBe('XP-5000');
    expect(asset['serial-number']).toBe('SN12345');
    expect(asset.manufacturer).toBe('PumpCo');
    expect(asset['installation-date']).toBe(1612137600);
    expect(asset['warranty-expiration']).toBe(1738368000);
    expect(asset.owner).toBe('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
  });
  
  it('should transfer asset ownership', () => {
    // First register an asset
    mockVM.registerAsset('Industrial Pump', 'XP-5000', 'SN12345', 'PumpCo', 1612137600, 1738368000);
    
    // Transfer to a new owner
    const newOwner = 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGN';
    const result = mockVM.transferAsset(1, newOwner);
    
    expect(result.result.value).toBe(true);
    
    // Verify the new owner
    const asset = mockVM.getAsset(1).result.value;
    expect(asset.owner).toBe(newOwner);
  });
  
  it('should fail to transfer asset if not the owner', () => {
    // First register an asset
    mockVM.registerAsset('Industrial Pump', 'XP-5000', 'SN12345', 'PumpCo', 1612137600, 1738368000);
    
    // Change the tx-sender to someone else
    mockVM.setTxSender('ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGO');
    
    // Try to transfer
    const newOwner = 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGN';
    const result = mockVM.transferAsset(1, newOwner);
    
    expect(result.result.error).toBe(2); // Not the owner error
    
    // Verify the owner hasn't changed
    const asset = mockVM.getAsset(1).result.value;
    expect(asset.owner).toBe('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
  });
});
