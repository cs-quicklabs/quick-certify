import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';

const NANOID_LENGTH = 21;
const NANOID_REGEX = /^[A-Za-z0-9_-]{21}$/; // nanoid default alphabet

@Injectable()
export class SlugOnlyPipe implements PipeTransform {
  transform(value: string) {
    if (this.isNanoid(value)) {
      throw new NotFoundException('Invalid Request');
    }
    return value;
  }

  private isNanoid(value: string): boolean {
    return value.length === NANOID_LENGTH && NANOID_REGEX.test(value);
  }
}
