;; Asset Registration Contract
;; Records details of critical industrial machinery

(define-data-var last-asset-id uint u0)

;; Asset structure
(define-map assets
  { asset-id: uint }
  {
    name: (string-utf8 100),
    model: (string-utf8 100),
    serial-number: (string-utf8 50),
    manufacturer: (string-utf8 100),
    installation-date: uint,
    warranty-expiration: uint,
    owner: principal
  }
)

;; Register a new asset
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

;; Get asset details
(define-read-only (get-asset (asset-id uint))
  (map-get? assets { asset-id: asset-id })
)

;; Transfer asset ownership
(define-public (transfer-asset (asset-id uint) (new-owner principal))
  (let ((asset (map-get? assets { asset-id: asset-id })))
    (asserts! (is-some asset) (err u1)) ;; Asset doesn't exist
    (asserts! (is-eq tx-sender (get owner (unwrap-panic asset))) (err u2)) ;; Not the owner

    (map-set assets
      { asset-id: asset-id }
      (merge (unwrap-panic asset) { owner: new-owner })
    )
    (ok true)
  )
)
