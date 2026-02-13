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

  generateRandomUrl(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomSuffix = '';
    for (let i = 0; i < 4; i++) {
      randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `https://test.${randomSuffix}.com`;
  }

  generateRandomSkillName(): string {
    const skillPrefixes = [
      'JavaScript',
      'TypeScript',
      'React',
      'Vue',
      'Angular',
      'Node',
      'Python',
      'Java',
      'CSharp',
      'Go',
      'Rust',
      'PHP',
      'Ruby',
      'Swift',
      'Kotlin',
    ];
    const randomPrefix = skillPrefixes[Math.floor(Math.random() * skillPrefixes.length)];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${randomPrefix}_${randomSuffix}`;
  }

  generateRandomEventTypeName(): string {
    const eventTypePrefixes = [
      'Conference',
      'Workshop',
      'Seminar',
      'Webinar',
      'Training',
      'Summit',
      'Symposium',
      'Meetup',
      'Hackathon',
      'Bootcamp',
      'Forum',
      'Exhibition',
      'Trade Show',
      'Convention',
      'Retreat',
    ];
    const randomPrefix = eventTypePrefixes[Math.floor(Math.random() * eventTypePrefixes.length)];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${randomPrefix}_${randomSuffix}`;
  }

  generateRandomEventLevelName(): string {
    const eventLevelPrefixes = [
      'Beginner',
      'Intermediate',
      'Advanced',
      'Expert',
      'Novice',
      'Professional',
      'Master',
      'Foundation',
      'Introductory',
      'Specialist',
    ];
    const randomPrefix = eventLevelPrefixes[Math.floor(Math.random() * eventLevelPrefixes.length)];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${randomPrefix}_${randomSuffix}`;
  }

  generateRandomEventFormatName(): string {
    const eventFormatPrefixes = [
      'Online',
      'In-Person',
      'Hybrid',
      'Virtual',
      'Live',
      'Recorded',
      'Self-Paced',
      'Synchronous',
      'Asynchronous',
      'Blended',
    ];
    const randomPrefix = eventFormatPrefixes[Math.floor(Math.random() * eventFormatPrefixes.length)];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${randomPrefix}_${randomSuffix}`;
  }
}
