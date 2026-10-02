import type { PaymentData, UserData } from './types';

let sequence = 0;

export function createUser(label = 'qa'): UserData {
  sequence += 1;
  const unique = `${Date.now()}-${process.pid}-${sequence}`;
  return {
    name: `QA ${label} ${unique}`,
    email: `qa.${label}.${unique}@example.com`,
    password: 'StrongPass123!',
    title: 'Mr',
    birthDay: '15',
    birthMonth: '6',
    birthYear: '1990',
    firstName: 'Victor',
    lastName: `QA${sequence}`,
    company: 'Unily QA',
    address1: '123 Automation Avenue',
    address2: 'Suite 26',
    country: 'Canada',
    state: 'Ontario',
    city: 'Toronto',
    zipcode: 'M5V 2T6',
    mobileNumber: `555010${String(sequence).padStart(4, '0')}`,
  };
}

export const paymentData: PaymentData = {
  nameOnCard: 'Victor QA',
  cardNumber: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: '2030',
};
