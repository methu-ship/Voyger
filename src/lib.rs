
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;
use alloc::vec::Vec;

use alloy_primitives::{Address, Uint, U256};
use alloy_sol_types::{sol};
use stylus_sdk::prelude::*;
use core::fmt; 

sol! {
    enum PaymentStatus {
        Pending,
        Paid
    }
}

sol_storage! {
    #[entrypoint]
        pub struct InvoiceCreation {
        mapping(uint256 => Invoice) invoices;
        uint256 invoice_counter;
    }

    pub struct Invoice {
        uint256 invoice_id;
        address sender;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        uint8 status; // 0 = Pending, 1 = Paid
        bool is_active;
    }
}
sol! {
    event InvoiceCreated(
        uint256 indexed invoice_id,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event InvoicePaid(
        uint256 indexed invoice_id,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );

    error InvoiceDoesNotExist(uint256 invoice_id);
    error UnauthorizedAccess(address caller, address authorized);
    error InvoiceAlreadyPaid(uint256 invoice_id);
    error InvalidAmount(uint256 amount);
    error InvalidAddress(address addr);
}
impl fmt::Debug for InvoiceDoesNotExist {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "InvoiceDoesNotExist")
    }
}

impl fmt::Debug for UnauthorizedAccess {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "UnauthorizedAccess")
    }
}

impl fmt::Debug for InvoiceAlreadyPaid {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "InvoiceAlreadyPaid")
    }
}

impl fmt::Debug for InvalidAmount {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "InvalidAmount")
    }
}

impl fmt::Debug for InvalidAddress {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "InvalidAddress")
    }
}

#[derive(SolidityError, Debug)]
pub enum InvoiceError {
    InvoiceDoesNotExist(InvoiceDoesNotExist),
    UnauthorizedAccess(UnauthorizedAccess),
    InvoiceAlreadyPaid(InvoiceAlreadyPaid),
    InvalidAmount(InvalidAmount),
    InvalidAddress(InvalidAddress),
}

// Implementation of utility functions
impl InvoiceCreation {
    fn validate_invoice_exists(&self, invoice_id: U256) -> Result<(), InvoiceError> {
        let invoice = self.invoices.get(invoice_id);
        if !invoice.is_active.get() {
            return Err(InvoiceError::InvoiceDoesNotExist(InvoiceDoesNotExist {
                invoice_id,
            }));
        }
        Ok(())
    }

    // Helper function to convert payment status
    fn get_payment_status(&self, status_value: Uint<8, 1>) -> u8 {
        let val: u8 = status_value.as_limbs()[0] as u8;
        match val {
            0 => 0,
            1 => 1,
            _ => 255,
        }
    }
}

#[public]
impl InvoiceCreation {
    pub fn create_invoice(
        &mut self,
        recipient_address: Address,
        amount: U256,
    ) -> Result<U256, InvoiceError> {
        // Validate inputs
        if recipient_address.is_zero() {
            return Err(InvoiceError::InvalidAddress(InvalidAddress {
                addr: recipient_address,
            }));
        }

          

        let sender = self.vm().msg_sender();
        let current_timestamp = self.vm().block_timestamp();
        
        // Increment counter
        let current_counter = self.invoice_counter.get();
        let new_invoice_id = current_counter + U256::from(1);
        self.invoice_counter.set(new_invoice_id);

        // Create and store invoice
        let mut invoice_setter = self.invoices.setter(new_invoice_id);
        invoice_setter.invoice_id.set(new_invoice_id);
        invoice_setter.sender.set(sender);
        invoice_setter.recipient.set(recipient_address);
        invoice_setter.amount.set(amount);
        invoice_setter.timestamp.set(U256::from(current_timestamp));
        invoice_setter.status.set(Uint::<8, 1>::from(0u8)); 
        invoice_setter.is_active.set(true);

        log(
            self.vm(),
            InvoiceCreated {
                invoice_id: new_invoice_id,
                sender,
                recipient: recipient_address,
                amount,
                timestamp: U256::from(current_timestamp),
            },
        );

        Ok(new_invoice_id)
    }

    pub fn mark_invoice_as_paid(&mut self, invoice_id: U256) -> Result<(), InvoiceError> {
        self.validate_invoice_exists(invoice_id)?;

        let caller = self.vm().msg_sender();
        let invoice = self.invoices.get(invoice_id);
        let recipient = invoice.recipient.get();
        let current_status = invoice.status.get();
        let amount = invoice.amount.get();
        if caller != recipient {
            return Err(InvoiceError::UnauthorizedAccess(UnauthorizedAccess {
                caller,
                authorized: recipient,
            }));
        }

       if current_status == Uint::<8, 1>::from(1u8) {
            return Err(InvoiceError::InvoiceAlreadyPaid(InvoiceAlreadyPaid {
                invoice_id,
            }));
        }
        let mut invoice_setter = self.invoices.setter(invoice_id);
        invoice_setter.status.set(Uint::<8, 1>::from(1u8)); // Paid

        log(
            self.vm(),
            InvoicePaid {
                invoice_id,
                payer: caller,
                amount,
                timestamp: U256::from(self.vm().block_timestamp()),
            },
        );

        Ok(())
    }


    pub fn get_invoice_status(&self, invoice_id: U256) -> Result<u8, InvoiceError> {
        self.validate_invoice_exists(invoice_id)?;
        let invoice = self.invoices.get(invoice_id);
        let status_value = invoice.status.get();
        Ok(self.get_payment_status(status_value))
    }

    pub fn get_invoices_for_address(&self, address: Address) -> Vec<U256> {
        let total_invoices = self.invoice_counter.get();
        let mut result = Vec::new();

        for i in 1..=total_invoices.as_limbs()[0] as u64 {
            let invoice_id = U256::from(i);
            let invoice = self.invoices.get(invoice_id);
            if invoice.is_active.get() {
                let sender = invoice.sender.get();
                let recipient = invoice.recipient.get();
                if sender == address || recipient == address {
                    result.push(invoice_id);
                }
            }
        }

        result
    }

    pub fn is_invoice_owner(&self, invoice_id: U256, address: Address) -> Result<bool, InvoiceError> {
        self.validate_invoice_exists(invoice_id)?;
        
        let invoice = self.invoices.get(invoice_id);
        let sender = invoice.sender.get();
        
        Ok(sender == address)
    }

    pub fn get_total_invoices(&self) -> U256 {
        self.invoice_counter.get()
    }

    pub fn get_invoices_by_status_for_address(
        &self,
        address: Address,
        status: u8,
    ) -> Vec<U256> {
        let total_invoices = self.invoice_counter.get();
        let mut result = Vec::new();
        let target_status = Uint::<8, 1>::from(match status {
            0 => 0u8, // Pending
            1 => 1u8, // Paid
            _ => 255u8, // Invalid
        });

        for i in 1..=total_invoices.as_limbs()[0] as u64 {
            let invoice_id = U256::from(i);
            let invoice = self.invoices.get(invoice_id);
            if invoice.is_active.get() && invoice.status.get() == target_status {
                let sender = invoice.sender.get();
                let recipient = invoice.recipient.get();
                if sender == address || recipient == address {
                    result.push(invoice_id);
                }
            }
        }

        result
    }

    // Function to get invoice count for an address
    pub fn get_invoice_count_for_address(&self, address: Address) -> (U256, U256) {
        let total_invoices = self.invoice_counter.get();
        let mut sent_count = U256::ZERO;
        let mut received_count = U256::ZERO;

        for i in 1..=total_invoices.as_limbs()[0] as u64 {
            let invoice_id = U256::from(i);
            let invoice = self.invoices.get(invoice_id);
            if invoice.is_active.get() {
                let sender = invoice.sender.get();
                let recipient = invoice.recipient.get();
                if sender == address {
                    sent_count += U256::from(1);
                }
                if recipient == address {
                    received_count += U256::from(1);
                }
            }
        }

        (sent_count, received_count)
    }
}


#[cfg(test)]
mod test {
    use super::*;
    use stylus_sdk::testing::*;
    use alloy_primitives::{Address, U256};

    #[test]
    fn test_create_invoice() {
        let vm = TestVM::default();
        let mut c = InvoiceCreation::from(&vm);
        
        let recipient = Address::repeat_byte(0x11);
        let amount = U256::from(1000u64);
        let invoice_id = c.create_invoice(recipient, amount).unwrap();
        
        assert_eq!(c.get_total_invoices(), U256::from(1));
        assert_eq!(c.get_invoice_status(invoice_id).unwrap(), 0u8); // Pending
        
        let recipient_invoices = c.get_invoices_for_address(recipient);
        assert_eq!(recipient_invoices.len(), 1);
        assert_eq!(recipient_invoices[0], invoice_id);
    }
}