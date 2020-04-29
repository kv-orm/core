import { Entity } from "../../../Entity/Entity";
import { Column } from "../../../Column/Column";
import { PrimaryColumn } from "../../../Column/PrimaryColumn";
import { UniqueColumn } from "../../../Column/UniqueColumn";
import { IndexableColumn } from "../../../Column/IndexableColumn";
import { columnType } from "../../../types/columnType";
import { libraryDatastore } from "../datastores/libraryDatastore.testhelpers";

const serialize = (value: columnType<Date>): string => {
  if (!(value instanceof Date)) throw new Error(`Value must be a date`);
  return value.toISOString();
};

const deserialize = (value: string): any => new Date(value);

@Entity({ datastore: libraryDatastore })
export class Author {
  @Column({ key: `givenName` })
  public firstName: columnType<string>;

  @Column()
  public lastName: columnType<string>;

  @Column()
  public nickName?: columnType<string>;

  @PrimaryColumn()
  public emailAddress: columnType<string>;

  @IndexableColumn()
  public birthYear: columnType<number>;

  @UniqueColumn()
  public phoneNumber: columnType<string>;

  public someUnsavedProperty: any;

  @Column()
  private _complex: columnType<string> = ``;

  set somethingComplex(value: columnType<any>) {
    this._complex = serialize(value);
  }

  get somethingComplex(): columnType<any> {
    return (async () => deserialize(await this._complex))();
  }

  public constructor({
    firstName,
    lastName,
    emailAddress,
    birthYear,
    phoneNumber,
  }: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    birthYear: number;
    phoneNumber: string;
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.emailAddress = emailAddress;
    this.birthYear = birthYear;
    this.phoneNumber = phoneNumber;
  }
}
