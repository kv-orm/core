import { Author } from "./models/Author.testhelpers";
import { williamShakespeare } from "./fixtures/williamShakespeare.testhelpers";
import { getRepository } from "../../Repository/Repository";
import { libraryDatastore } from "./datastores/libraryDatastore.testhelpers";

const repository = getRepository(Author);

describe(`library`, () => {
  describe(`README.md example`, () => {
    beforeEach(() => {
      (async () => await repository.save(williamShakespeare))();
    });

    it(`async await read firstName`, async () => {
      expect(await williamShakespeare.firstName).toEqual(`William`);
    });

    it(`property getters/setters`, async () => {
      const date = new Date(`2020-01-02T03:04:05Z`);
      williamShakespeare.somethingComplex = date;
      expect(await williamShakespeare.somethingComplex).toEqual(date);
    });

    it(`repository saves/loads`, async () => {
      const loadedWilliamShakespeare = await repository.load(
        `william@shakespeare.com`
      );
      expect(await loadedWilliamShakespeare.nickName).toEqual(`Bill`);
    });

    it(`repository finds`, async () => {
      const foundWilliamShakespeare = await repository.find(
        `phoneNumber`,
        `+1234567890`
      );

      expect(foundWilliamShakespeare).not.toBeNull();
      expect(await foundWilliamShakespeare?.nickName).toEqual(`Bill`);

      const foundNonexistent = await repository.find(
        `phoneNumber`,
        `+9999999999`
      );

      expect(foundNonexistent).toBeNull();
    });

    it(`repository searches`, async () => {
      const searchedAuthors = await repository.search(`birthYear`, 1564);

      let i = 0;
      for await (const searchedAuthor of searchedAuthors) {
        expect(await searchedAuthor.nickName).toEqual("Bill");
        i++;
      }

      expect(i).toBe(1);
    });
  });

  describe(`the datastore`, () => {
    it(`is saved as expected`, () => {
      expect((libraryDatastore as any).data).toMatchInlineSnapshot(`
        Map {
          "Author:william@shakespeare.com:_complex" => "2020-01-02T03:04:05.000Z",
          "Author:william@shakespeare.com:givenName" => "William",
          "Author:william@shakespeare.com:lastName" => "Shakespeare",
          "Author:william@shakespeare.com:emailAddress" => "william@shakespeare.com",
          "Author:phoneNumber:+1234567890" => "william@shakespeare.com",
          "Author:william@shakespeare.com:phoneNumber" => "+1234567890",
          "Author:birthYear:1564:william@shakespeare.com" => "william@shakespeare.com",
          "Author:william@shakespeare.com:birthYear" => 1564,
          "Author:william@shakespeare.com:nickName" => "Bill",
        }
      `);
    });
  });
});
