;; Technician Certification Contract
;; Validates qualifications for specific equipment

;; Certification structure
(define-map certifications
  { technician: principal, equipment-type: (string-utf8 50) }
  {
    certification-date: uint,
    expiration-date: uint,
    certification-level: uint,
    issuer: principal,
    is-active: bool
  }
)

;; List of authorized certification issuers
(define-map authorized-issuers
  { issuer: principal }
  { is-authorized: bool }
)

;; Initialize contract owner as authorized issuer
(define-data-var contract-owner principal tx-sender)

;; Initialize contract
(map-set authorized-issuers
  { issuer: tx-sender }
  { is-authorized: true }
)

;; Add a new authorized issuer
(define-public (add-authorized-issuer (issuer principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err u1)) ;; Only contract owner can add issuers
    (map-set authorized-issuers
      { issuer: issuer }
      { is-authorized: true }
    )
    (ok true)
  )
)

;; Issue certification to a technician
(define-public (issue-certification
    (technician principal)
    (equipment-type (string-utf8 50))
    (certification-date uint)
    (expiration-date uint)
    (certification-level uint))
  (let ((issuer-auth (map-get? authorized-issuers { issuer: tx-sender })))
    (asserts! (and (is-some issuer-auth) (get is-authorized (unwrap-panic issuer-auth))) (err u1)) ;; Not authorized
    (asserts! (< certification-date expiration-date) (err u2)) ;; Invalid dates

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

;; Check if a technician is certified for specific equipment
(define-read-only (is-certified (technician principal) (equipment-type (string-utf8 50)) (current-time uint))
  (let ((cert (map-get? certifications { technician: technician, equipment-type: equipment-type })))
    (if (is-some cert)
      (let ((cert-data (unwrap-panic cert)))
        (and
          (get is-active cert-data)
          (>= (get expiration-date cert-data) current-time)
        )
      )
      false
    )
  )
)

;; Revoke certification
(define-public (revoke-certification (technician principal) (equipment-type (string-utf8 50)))
  (let ((issuer-auth (map-get? authorized-issuers { issuer: tx-sender })))
    (asserts! (and (is-some issuer-auth) (get is-authorized (unwrap-panic issuer-auth))) (err u1)) ;; Not authorized

    (let ((cert (map-get? certifications { technician: technician, equipment-type: equipment-type })))
      (asserts! (is-some cert) (err u2)) ;; Certification doesn't exist

      (map-set certifications
        { technician: technician, equipment-type: equipment-type }
        (merge (unwrap-panic cert) { is-active: false })
      )
      (ok true)
    )
  )
)
