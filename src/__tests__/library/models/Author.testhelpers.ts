import { libraryDatastore } from "../datastores/libraryDatastore.testhelpers";
import { Entity } from "../../../Entity/Entity";
import { Column } from "../../../Column/Column";
import { columnType } from "../../../types/columnType";

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

  @Column({ isPrimary: true })
  public emailAddress: columnType<string>;

  @Column({ isIndexable: true })
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
    phoneNumber,
  }: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.emailAddress = emailAddress;
    this.phoneNumber = phoneNumber;
  }
}
