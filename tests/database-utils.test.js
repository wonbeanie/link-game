import { updateTable } from "../src/lib/database-utils.js";

describe("database utils", () => {
  test("중첩 객체에서 null 값은 해당 키를 제거한다", () => {
    const table = {
      VoteList: {
        방장: "유저",
        유저: "방장"
      }
    };

    const result = updateTable(table, {
      VoteList: {
        방장: null
      }
    });

    expect(result.VoteList).toEqual({
      유저: "방장"
    });
  });
});
