/* This file will be use to generate the random test data
* Currently Generating Below Test Data :
* Random Email
* Random Name


*/

export class RandomDataGenerator {
  generateRandomEmail(): string {
    const random4Digit = Math.floor(1000 + Math.random() * 9000);
    return `test_${random4Digit}@test.com`;
  }

  generateRandomName(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomSuffix = '';
    for (let i = 0; i < 4; i++) {
      randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `test_${randomSuffix}issuer`;
  }
}
