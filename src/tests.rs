use stylus_sdk::test::{deploy_contract, call_contract};
use stylus_hello_world::*;
use alloy_primitives::{Address, U256};

#[test]
fn test_create_invoice() {
    let mut contract = InvoiceCreation::deploy();
    let recipient = Address::repeat_byte(0x11);
    let amount = U256::from(1000u64);
    let invoice_id = contract.create_invoice(recipient, amount).unwrap();
    let (sender, rec, amt, status, timestamp, is_active) = contract.get_invoice(invoice_id).unwrap();
    assert_eq!(rec, recipient);
    assert_eq!(amt, amount);
    assert_eq!(status, 0u8); // Pending
    assert!(is_active);
}

#[test]
fn test_mark_invoice_as_paid() {
    let mut contract = InvoiceCreation::deploy();
    let recipient = Address::repeat_byte(0x22);
    let amount = U256::from(500u64);
    let invoice_id = contract.create_invoice(recipient, amount).unwrap();
    // Simulate recipient paying
    contract.mark_invoice_as_paid(invoice_id).unwrap();
    let (_, _, _, status, _, _) = contract.get_invoice(invoice_id).unwrap();
    assert_eq!(status, 1u8); // Paid
}
