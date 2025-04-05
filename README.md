# 🔧 Blockchain-Based Specialized Equipment Maintenance System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Clarity](https://img.shields.io/badge/language-Clarity-orange.svg)

</div>

A secure, transparent, and decentralized solution for managing critical industrial equipment maintenance using blockchain technology.

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Smart Contracts](#-smart-contracts)
- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
- [Usage Examples](#-usage-examples)
- [Development](#-development)
- [Testing](#-testing)
- [Security Considerations](#-security-considerations)
- [Contributing](#-contributing)
- [License](#-license)

## 🔍 Overview

This system leverages blockchain technology to create an immutable, transparent record of industrial equipment maintenance activities. It ensures that maintenance records are tamper-proof, technician certifications are verifiable, and parts inventory is accurately tracked throughout the equipment lifecycle.

**Benefits:**
- **Transparency**: All maintenance activities are recorded on the blockchain
- **Accountability**: Clear tracking of who performed what maintenance and when
- **Compliance**: Easily demonstrate regulatory compliance with immutable records
- **Efficiency**: Streamlined processes for maintenance scheduling and parts management
- **Trust**: Verifiable technician certifications and equipment history

## 🏗 System Architecture

The system consists of four interconnected smart contracts that work together to provide a comprehensive equipment maintenance solution:

```markdown file="README.md"
...
```

┌─────────────────────┐      ┌─────────────────────┐
│                     │      │                     │
│  Asset Registration │◄────►│ Technician Certification │
│                     │      │                     │
└─────────┬───────────┘      └─────────┬───────────┘
│                            │
│                            │
▼                            ▼
┌─────────────────────┐      ┌─────────────────────┐
│                     │      │                     │
│ Maintenance Scheduling │◄──►│   Parts Inventory   │
│                     │      │                     │
└─────────────────────┘      └─────────────────────┘

```plaintext

## 📝 Smart Contracts

### Asset Registration Contract
Tracks and manages all equipment assets in the system.

```clarity
;; Register a new industrial asset
(define-public (register-asset 
    (name (string-utf8 100))
    (model (string-utf8 100))
    (serial-number (string-utf8 50))
    (manufacturer (string-utf8 100))
    (installation-date uint)
    (warranty-expiration uint))
  (let ((new-id (+ (var-get last-asset-id) u1)))
    (var-set last-asset-id new-id)
    (map-set assets
      { asset-id: new-id }
      {
        name: name,
        model: model,
        serial-number: serial-number,
        manufacturer: manufacturer,
        installation-date: installation-date,
        warranty-expiration: warranty-expiration,
        owner: tx-sender
      }
    )
    (ok new-id)
  )
)
```

### Technician Certification Contract

Validates and manages technician qualifications for specific equipment types.

```plaintext
;; Issue certification to a technician
(define-public (issue-certification 
    (technician principal)
    (equipment-type (string-utf8 50))
    (certification-date uint)
    (expiration-date uint)
    (certification-level uint))
  (let ((issuer-auth (map-get? authorized-issuers { issuer: tx-sender })))
    (asserts! (and (is-some issuer-auth) (get is-authorized (unwrap-panic issuer-auth))) (err u1))
    (asserts! (< certification-date expiration-date) (err u2))
    
    (map-set certifications
      { technician: technician, equipment-type: equipment-type }
      {
        certification-date: certification-date,
        expiration-date: expiration-date,
        certification-level: certification-level,
        issuer: tx-sender,
        is-active: true
      }
    )
    (ok true)
  )
)
```

### Maintenance Scheduling Contract

Manages service schedules based on equipment usage and conditions.

```plaintext
;; Schedule maintenance for an asset
(define-public (schedule-maintenance 
    (asset-id uint)
    (scheduled-date uint)
    (description (string-utf8 200))
    (priority uint))
  (let ((new-id (+ (var-get last-maintenance-id) u1)))
    (asserts! (and (>= priority u1) (<= priority u5)) (err u1))
    
    (var-set last-maintenance-id new-id)
    (map-set maintenance-records
      { maintenance-id: new-id }
      {
        asset-id: asset-id,
        scheduled-date: scheduled-date,
        completed-date: none,
        technician: none,
        description: description,
        status: "scheduled",
        priority: priority,
        created-by: tx-sender
      }
    )
    (ok new-id)
  )
)
```

### Parts Inventory Contract

Tracks availability and usage of critical replacement components.

```plaintext
;; Register a new part in inventory
(define-public (register-part 
    (name (string-utf8 100))
    (description (string-utf8 200))
    (compatible-equipment (list 10 (string-utf8 50)))
    (quantity uint)
    (reorder-threshold uint)
    (supplier (string-utf8 100))
    (location (string-utf8 50)))
  (let ((new-id (+ (var-get last-part-id) u1)))
    (var-set last-part-id new-id)
    (map-set parts
      { part-id: new-id }
      {
        name: name,
        description: description,
        compatible-equipment: compatible-equipment,
        quantity: quantity,
        reorder-threshold: reorder-threshold,
        supplier: supplier,
        location: location,
        manager: tx-sender
      }
    )
    
    ;; Record initial inventory transaction
    (let ((tx-id (+ (var-get last-transaction-id) u1)))
      (var-set last-transaction-id tx-id)
      (map-set part-transactions
        { transaction-id: tx-id }
        {
          part-id: new-id,
          transaction-type: "add",
          quantity: quantity,
          timestamp: block-height,
          performed-by: tx-sender,
          maintenance-id: none
        }
      )
    )
    
    (ok new-id)
  )
)
```

## 🌟 Key Features

### Asset Management

- **Registration**: Record detailed information about industrial machinery
- **Ownership Tracking**: Maintain chain of custody for equipment
- **Warranty Management**: Track warranty periods and coverage
- **Transfer**: Securely transfer ownership between entities


### Technician Certification

- **Qualification Verification**: Ensure technicians are qualified for specific equipment
- **Certification Levels**: Support different levels of certification
- **Expiration Management**: Track and enforce certification expiration
- **Authorized Issuers**: Control who can issue certifications


### Maintenance Scheduling

- **Prioritized Scheduling**: Assign priority levels to maintenance tasks
- **Status Tracking**: Monitor maintenance from scheduling to completion
- **Technician Assignment**: Assign qualified technicians to tasks
- **Maintenance History**: Maintain complete maintenance records


### Parts Inventory

- **Inventory Tracking**: Monitor availability of critical parts
- **Automatic Reordering**: Trigger reorder notifications when inventory is low
- **Usage Tracking**: Associate parts usage with specific maintenance activities
- **Transaction History**: Maintain audit trail of all inventory changes


## 🚀 Getting Started

### Prerequisites

- Clarity development environment
- Vitest for testing
- Basic understanding of blockchain concepts


### Installation

1. Clone the repository:

```shellscript
git clone https://github.com/your-org/equipment-maintenance-blockchain.git
cd equipment-maintenance-blockchain
```


2. Install dependencies:

```shellscript
npm install
```


3. Deploy the contracts to your blockchain environment:

```shellscript
# Example deployment command - adjust based on your environment
clarinet deploy
```




## 💻 Usage Examples

### Complete Maintenance Workflow

1. **Register an asset**:

```plaintext
(contract-call? .asset-registration register-asset 
  "Industrial Pump" 
  "XP-5000" 
  "SN12345" 
  "PumpCo" 
  1612137600  ;; Feb 1, 2021
  1738368000) ;; Feb 1, 2025
```


2. **Certify a technician**:

```plaintext
(contract-call? .technician-certification issue-certification 
  'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGN  ;; Technician's address
  "Industrial Pump XP-5000"                    ;; Equipment type
  1612137600                                   ;; Certification date
  1738368000                                   ;; Expiration date
  3)                                           ;; Certification level
```


3. **Schedule maintenance**:

```plaintext
(contract-call? .maintenance-scheduling schedule-maintenance 
  1                                  ;; Asset ID
  1612137600                         ;; Scheduled date
  "Regular maintenance for pump"     ;; Description
  2)                                 ;; Priority (1-5, 1 is highest)
```


4. **Assign technician**:

```plaintext
(contract-call? .maintenance-scheduling assign-technician 
  1                                           ;; Maintenance ID
  'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGN) ;; Technician's address
```


5. **Remove parts from inventory**:

```plaintext
(contract-call? .parts-inventory remove-parts 
  1           ;; Part ID
  2           ;; Quantity
  (some 1))   ;; Maintenance ID (optional)
```


6. **Complete maintenance**:

```plaintext
(contract-call? .maintenance-scheduling complete-maintenance 
  1           ;; Maintenance ID
  1612224000) ;; Completion date
```




## 🛠 Development

### Project Structure

```plaintext
├── contracts/
│   ├── asset-registration.clar
│   ├── technician-certification.clar
│   ├── maintenance-scheduling.clar
│   └── parts-inventory.clar
├── tests/
│   ├── asset-registration.test.js
│   ├── technician-certification.test.js
│   ├── maintenance-scheduling.test.js
│   └── parts-inventory.test.js
├── README.md
└── PR.md
```

### Extending the System

To add new features:

1. Identify the appropriate contract to modify
2. Implement new functions following the existing patterns
3. Update tests to cover new functionality
4. Document the changes in the README


## 🧪 Testing

Run the test suite to verify contract functionality:

```shellscript
npm test
```

The tests use Vitest and mock the Clarity VM interactions to test contract functionality without external dependencies.

Example test:

```javascript
it('should register a new asset', () => {
  const result = mockVM.registerAsset(
    'Industrial Pump', 
    'XP-5000', 
    'SN12345', 
    'PumpCo', 
    1612137600,
    1738368000
  );
  
  expect(result.result.value).toBe(1);
  
  const asset = mockVM.getAsset(1).result.value;
  expect(asset.name).toBe('Industrial Pump');
  expect(asset.model).toBe('XP-5000');
});
```

## 🔒 Security Considerations

- **Access Control**: All contracts implement proper authorization checks
- **Data Validation**: Input validation is performed before state changes
- **Error Handling**: Comprehensive error handling with meaningful error codes
- **Upgradability**: Consider implementing upgrade patterns for future improvements


## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

```plaintext

```
