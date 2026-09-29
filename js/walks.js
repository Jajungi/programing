(function () {
  "use strict";

  function w(text, id, kind) {
    var token = { t: text };
    if (id) token.id = id;
    if (kind) token.k = kind;
    return token;
  }

  function step(titleKo, titleEn, ko, en, extra) {
    var item = {
      titleKo: titleKo,
      titleEn: titleEn,
      ko: ko,
      en: en,
      name: [],
      idx: [],
      out: []
    };
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        item[key] = extra[key];
      });
    }
    return item;
  }

  function cell(index, value, shade) {
    return { i: String(index), v: String(value), shade: shade || "" };
  }

  function lane(name, captionKo, captionEn, rows) {
    return { name: name, captionKo: captionKo, captionEn: captionEn, rows: rows };
  }

  var py = ["P", "y", "t", "h", "o", "n"];

  function wordLane(hot, captionKo, captionEn) {
    var topHot = hot < 0 ? hot + py.length : hot;
    var top = py.map(function (ch, i) {
      var shade = "";
      if (i === topHot) shade = "hot";
      else if (i < topHot) shade = "in";
      return cell(i, ch, shade);
    });
    var bot = py.map(function (ch, i) {
      var neg = i - py.length;
      return cell(neg, ch, neg === hot ? "hot" : "");
    });
    return lane("word", captionKo, captionEn, hot < 0 ? [top, bot] : [top]);
  }

  var WALKS = {
    io: {
      lines: [
        [w("b"), w(" = "), w("2", "n2", "num")],
        [w("print", "pr1", "fn"), w("("), w('"b ="', "s1", "str"), w(", "), w("float", "fl", "fn"), w("("), w("b", "b1"), w("))")],
        [w("text"), w(" = "), w("input", "inp", "fn"), w("("), w('"Enter a number: "', "prompt", "str"), w(")")],
        [w("n"), w(" = "), w("int", "intn", "fn"), w("("), w("text", "text1"), w(")")],
        [w("print", "pr2", "fn"), w("("), w("f\"n={n}\"", "fs", "str"), w(")")],
        [w("# print(\"skip\")", "cmt", "cmt")]
      ],
      steps: [
        step("이름 b", "Name b", "오른쪽 2를 계산해 이름 b에 연결한다. b는 정수 2다.", "The 2 on the right is bound to the name b. b is the integer 2.", { line: 0, name: ["n2"] }),
        step("print와 float", "print and float", "쉼표로 넘긴 인자(argument)를 공백으로 구분해 출력한다. float(b)는 2를 실수 2.0으로 바꾼 새 값이다. print 자체의 반환값(return value)은 None이다.", "Arguments separated by commas are printed with a space between them. float(b) is a new float, 2.0. print itself returns None.", { line: 1, name: ["pr1", "fl", "b1"], out: ["s1"] }),
        step("input", "input", "input은 한 줄을 문자열(string)로 돌려준다. 4를 치면 text는 글자 \"4\"이지 정수 4가 아니다.", "input returns one line as a string. If the line is 4, text is the characters \"4\", not the integer 4.", { line: 2, name: ["inp"], idx: ["prompt"] }),
        step("int", "int", "int는 \"4\"를 정수 4로 바꾼 새 값을 반환한다. text 자체는 여전히 문자열이다.", "int returns a new integer, 4. text itself is still a string.", { line: 3, name: ["text1"], out: ["intn"] }),
        step("f-string", "f-string", "중괄호 안의 n을 먼저 계산한다. n이 4이므로 만들어지는 문자열은 \"n=4\"다. 그 문자열을 print가 출력한다.", "The n inside the braces is evaluated first. n is 4, so the string is \"n=4\". print then writes that string.", { line: 4, name: ["fs"], out: ["pr2"] }),
        step("주석", "Comment", "# 부터 그 줄 끝은 읽지 않는다. print(\"skip\")은 실행되지 않는다.", "From # to the end of the line is not read. print(\"skip\") does not run.", { line: 5, idx: ["cmt"] })
      ]
    },
    values: {
      lines: [
        [w("n"), w(" = "), w("9", "nine", "num")],
        [w("n", "nL"), w(" = "), w("n", "nR"), w(" - "), w("2", "two", "num")],
        [w("a"), w(" = "), w("b"), w(" = "), w("2", "both", "num")],
        [w("name"), w(", "), w("age"), w(" = "), w("[\"Ada\", \"20\"]", "pair", "str")],
        [w("print", "pr", "fn"), w("("), w("type", "ty", "fn"), w("("), w("n", "nT"), w("))")]
      ],
      steps: [
        step("첫 대입", "First assignment", "오른쪽 9를 이름 n에 넣는다. = 은 비교가 아니다.", "The 9 on the right is bound to n. = is not a comparison.", { line: 0, name: ["nine"] }),
        step("다시 대입", "Assign again", "오른쪽의 n은 아직 9다. 9 - 2를 계산한 7을 n에 다시 넣는다.", "The n on the right is still 9. 9 - 2 is 7, and that 7 is stored back in n.", { line: 1, name: ["nR", "two"], out: ["nL"] }),
        step("연쇄 대입", "Chained assignment", "2를 한 번 계산하고, 그 같은 값을 a와 b에 연결한다.", "2 is evaluated once, and that same value is bound to both a and b.", { line: 2, name: ["both"] }),
        step("언패킹", "Unpacking", "오른쪽 칸이 두 개다. 첫 칸 \"Ada\"는 name, 둘째 칸 \"20\"은 age다. 개수가 다르면 ValueError다.", "The right side has two elements. \"Ada\" goes to name and \"20\" goes to age. A different count raises ValueError.", { line: 3, name: ["pair"], lane: lane("오른쪽", "0번 \"Ada\", 1번 \"20\". 왼쪽 이름도 두 개여야 한다.", "Index 0 is \"Ada\" and index 1 is \"20\". The left side needs two names as well.", [[cell(0, "Ada", "hot"), cell(1, "20", "in")]]) }),
        step("type", "type", "지금 n은 7이다. type(n)은 그 자료형(type)인 int를 반환하고, print가 그것을 출력한다.", "n is now 7. type(n) returns its type, int, and print writes that.", { line: 4, name: ["nT"], out: ["ty", "pr"] })
      ]
    },
    convert: {
      lines: [
        [w("print", null, "fn"), w("("), w("int", "i1", "fn"), w("("), w("9.9", "f99", "num"), w("))")],
        [w("print", null, "fn"), w("("), w("int", "i2", "fn"), w("("), w('"9"', "s9", "str"), w("))")],
        [w("print", null, "fn"), w("("), w("float", "fl", "fn"), w("("), w("2", "n2", "num"), w("))")],
        [w("print", null, "fn"), w("("), w('"a = "', "sa", "str"), w(" + "), w("str", "st", "fn"), w("("), w("1", "one", "num"), w("))")],
        [w("chars"), w(" = "), w("list", "ls", "fn"), w("("), w('"ab"', "ab", "str"), w(")")],
        [w("pair"), w(" = "), w("tuple", "tu", "fn"), w("("), w("[1, 2]", "lst", "str"), w(")")],
        [w("menu"), w(" = "), w('{"Burger": 5500}', "dic", "str")]
      ],
      steps: [
        step("int(실수)", "int of a float", "9.9에서 소수점 아래를 버린다. 반환값은 정수 9다.", "The fraction of 9.9 is dropped. The return value is the integer 9.", { line: 0, name: ["f99"], out: ["i1"] }),
        step("int(문자열)", "int of a string", "글자 \"9\"를 정수 9로 읽는다. \"9.0\"처럼 점이 있으면 int는 직접 받지 않는다.", "The characters \"9\" are read as the integer 9. int does not accept \"9.0\" directly.", { line: 1, name: ["s9"], out: ["i2"] }),
        step("float", "float", "정수 2를 실수 2.0으로 바꾼 새 값을 반환한다.", "Returns a new float, 2.0, made from the integer 2.", { line: 2, name: ["n2"], out: ["fl"] }),
        step("str", "str", "수 1은 문자열이 아니다. str(1)이 \"1\"을 만든 뒤에야 \"a = \"와 + 로 붙일 수 있다. 결과는 \"a = 1\"이다.", "The number 1 is not a string. str(1) makes \"1\", and only then can + join it to \"a = \". The result is \"a = 1\".", { line: 3, name: ["one"], out: ["st", "sa"] }),
        step("list", "list", "문자열 \"ab\"의 문자가 한 칸씩 된다. chars는 ['a', 'b']다. 원본 문자열은 그대로다.", "Each character of \"ab\" becomes one element. chars is ['a', 'b']. The original string stays as it was.", { line: 4, name: ["ab"], out: ["ls"], lane: lane('"ab"', "0번 a, 1번 b. 이 칸들로 새 리스트를 만든다.", "Index 0 is a and index 1 is b. Those elements form a new list.", [[cell(0, "a", "in"), cell(1, "b", "in")]]) }),
        step("tuple", "tuple", "[1, 2]의 칸을 새 튜플 (1, 2)로 고정한다. 만들어진 튜플의 칸은 대입으로 바꾸지 못한다.", "The elements of [1, 2] are frozen into the new tuple (1, 2). Those elements cannot be replaced by assignment.", { line: 5, name: ["lst"], out: ["tu"] }),
        step("dict", "dict", "{\"Burger\": 5500}은 키 Burger와 값 5500을 가진 딕셔너리다. {}만 적어도 빈 딕셔너리다.", "{\"Burger\": 5500} is a dictionary with key Burger and value 5500. {} alone is an empty dictionary.", { line: 6, name: ["dic"] })
      ]
    },
    ops: {
      lines: [
        [w("x"), w(" = "), w("9.0", "x0", "num")],
        [w("print", null, "fn"), w("("), w("x", "xd"), w(" / "), w("2", "d2", "num"), w(")")],
        [w("print", null, "fn"), w("("), w("x", "xf"), w(" // "), w("2", "f2", "num"), w(")")],
        [w("print", null, "fn"), w("("), w("x", "xm"), w(" % "), w("2", "m2", "num"), w(")")],
        [w("print", null, "fn"), w("("), w("x", "xp"), w(" ** "), w("3", "p3", "num"), w(")")],
        [w("n"), w(" = "), w("4", "n4", "num")],
        [w("n", "nL"), w(" *= "), w("2", "nmul", "num")],
        [w("print", null, "fn"), w("("), w("1 < 2 < 3", "cmp"), w(")")],
        [w("print", null, "fn"), w("("), w('"Py"', "py", "str"), w(" in "), w('"Python"', "py2", "str"), w(")")],
        [w("print", null, "fn"), w("("), w('"Math"', "math", "str"), w(" in "), w('{"major": "Math"}', "maj", "str"), w(")")],
        [w("print", null, "fn"), w("("), w("x", "xm2"), w(" * "), w("2", "mul2", "num"), w(")")],
        [w("print", null, "fn"), w("("), w("2 == 3", "eq"), w(")")],
        [w("print", null, "fn"), w("("), w('"LOL"', "lol", "str"), w(" not in "), w('"Python"', "py3", "str"), w(")")]
      ],
      steps: [
        step("실수 x", "Float x", "x는 실수 9.0이다. 이 다음 연산의 결과도 실수가 된다.", "x is the float 9.0. The following operations therefore return floats.", { line: 0, name: ["x0"] }),
        step("/ ", "/ ", "9.0 / 2는 4.5다. / 는 양쪽이 정수여도 float를 반환한다.", "9.0 / 2 is 4.5. / returns a float even when both operands are integers.", { line: 1, name: ["xd", "d2"], out: ["xd"] }),
        step("//", "//", "9.0 // 2는 몫 4.0이다. 나머지는 여기 포함되지 않는다.", "9.0 // 2 is the quotient 4.0. The remainder is not part of this result.", { line: 2, name: ["xf", "f2"] }),
        step("%", "%", "9.0 % 2는 나머지 1.0이다.", "9.0 % 2 is the remainder 1.0.", { line: 3, name: ["xm", "m2"] }),
        step("**", "**", "9.0 ** 3은 9.0을 세 번 곱한 729.0이다.", "9.0 ** 3 is 729.0, 9.0 multiplied by itself three times.", { line: 4, name: ["xp", "p3"] }),
        step("*=", "*=", "n은 4다. n *= 2는 n = n * 2와 같아서 n은 8이 된다.", "n is 4. n *= 2 is the same computation as n = n * 2, so n becomes 8.", { line: 6, name: ["nL", "nmul"] }),
        step("연쇄 비교", "Chained comparison", "1 < 2와 2 < 3이 모두 참일 때만 True다. 결과는 True다.", "The result is True only when both 1 < 2 and 2 < 3 are true. The result is True.", { line: 7, idx: ["cmp"] }),
        step("문자열 in", "in for a string", "\"Python\" 안에 연속된 \"Py\"가 있다. True다.", "\"Python\" contains the contiguous text \"Py\". The result is True.", { line: 8, name: ["py2"], idx: ["py"] }),
        step("딕셔너리 in", "in for a dictionary", "오른쪽은 키만 본다. \"Math\"는 값이고 키가 아니므로 False다.", "The right side looks only at keys. \"Math\" is a value, not a key, so the result is False.", { line: 9, name: ["maj"], idx: ["math"], lane: lane("딕셔너리", "키는 major 하나다. Math는 그 키의 값이다.", "The only key is major. Math is that key's value.", [[cell("major", "Math", "in"), cell("찾는 글", "Math", "out")]]) }),
        step("*", "*", "9.0 * 2는 18.0이다. 피연산자가 실수이므로 결과도 실수다.", "9.0 * 2 is 18.0. An operand is a float, so the result is a float.", { line: 10, name: ["xm2", "mul2"] }),
        step("==", "==", "2 == 3은 값이 같은지 묻는 비교다. 결과는 False다. = 와는 다른 기호다.", "2 == 3 asks whether the values are equal. The result is False. The sign is different from =.", { line: 11, idx: ["eq"] }),
        step("not in", "not in", "\"Python\" 안에 \"LOL\"이 없다. not in은 그 없음을 물어 True다.", "\"Python\" does not contain \"LOL\". not in asks about that absence, so the result is True.", { line: 12, name: ["py3"], idx: ["lol"] })
      ]
    },
    loops: {
      lines: [
        [w("s"), w(" = "), w('"Hi"', "hi", "str")],
        [w("for ", null, "kw"), w("ch"), w(" in "), w("s", "sfor"), w(":")],
        [w("    print", "pch", "fn"), w("("), w("ch", "ch1"), w(")")],
        [w("for ", null, "kw"), w("i"), w(" in "), w("range", "rg", "fn"), w("("), w("1", "r1", "num"), w(", "), w("4", "r4", "num"), w("):")],
        [w("    print", null, "fn"), w("("), w("i", "iv"), w(")")],
        [w("k"), w(" = "), w("0", "k0", "num")],
        [w("while ", null, "kw"), w("k", "kw1"), w(" < "), w("2", "k2", "num"), w(":")],
        [w("    k", "kL"), w(" = "), w("k", "kR"), w(" + "), w("1", "one", "num")],
        [w("for ", null, "kw"), w("a"), w(" in "), w("range", null, "fn"), w("(2, 4):")],
        [w("    for ", null, "kw"), w("b"), w(" in "), w("range", null, "fn"), w("(1, 3):")],
        [w("        print", null, "fn"), w("("), w("a, b", "ab"), w(")")]
      ],
      steps: [
        step("for의 묶음", "The for sequence", "s는 \"Hi\"다. for는 이 문자를 앞에서부터 ch에 하나씩 넣는다.", "s is \"Hi\". for binds each character to ch, from the front.", { line: 1, name: ["sfor"], lane: lane("s", "0번 H를 먼저 넣고, 그 다음 1번 i를 넣는다.", "Index 0, H, is bound first, then index 1, i.", [[cell(0, "H", "hot"), cell(1, "i", "in")]]) }),
        step("본문", "The body", "ch가 H일 때 print가 H를 찍고, 다시 올라와 ch가 i일 때 i를 찍는다.", "print writes H while ch is H, then returns to the for and writes i while ch is i.", { line: 2, name: ["ch1"], out: ["pch"] }),
        step("range의 끝", "The stop of range", "range(1, 4)는 1에서 시작해 4 직전까지다. 만들어지는 수는 1, 2, 3이고 4는 빠진다.", "range(1, 4) starts at 1 and stops before 4. The numbers are 1, 2, and 3. 4 is excluded.", { line: 3, name: ["r1"], idx: ["r4"], out: ["rg"], lane: lane("range(1, 4)", "1, 2, 3만 i가 된다. 4는 끝 번호라 포함되지 않는다.", "i becomes 1, then 2, then 3. 4 is the stop, so it is not included.", [[cell(1, "1", "in"), cell(2, "2", "in"), cell(3, "3", "hot"), cell("끝", "4", "out")]]) }),
        step("while 조건", "while condition", "k는 0이다. 0 < 2가 참이므로 본문으로 들어간다.", "k is 0. 0 < 2 is true, so the body runs.", { line: 6, name: ["kw1"], idx: ["k2"] }),
        step("while 본문", "while body", "k + 1을 k에 다시 넣는다. k가 1이 된 뒤 조건을 다시 보고, k가 2가 되면 2 < 2가 거짓이라 멈춘다.", "k + 1 is stored back in k. After k becomes 1 the condition is tested again. When k is 2, 2 < 2 is false and the loop stops.", { line: 7, name: ["kR", "one"], out: ["kL"] }),
        step("중첩 for", "Nested for", "바깥 a가 2인 동안 안쪽 b가 1, 그다음 2를 모두 돈다. a가 3이 되면 b를 다시 1부터 돈다. 출력은 2 1, 2 2, 3 1, 3 2다.", "While a is 2, b runs through 1 and then 2. When a becomes 3, b starts again at 1. The output is 2 1, 2 2, 3 1, 3 2.", { line: 10, name: ["ab"] })
      ]
    },
    indexing: {
      lines: [
        [w("word"), w(" = "), w('"Python"', "w0", "str")],
        [w("print", null, "fn"), w("("), w("word", "wA"), w("["), w("0", "i0", "num"), w("])")],
        [w("print", null, "fn"), w("("), w("word", "wB"), w("["), w("-1", "i1", "num"), w("])")],
        [w("nums"), w(" = "), w("[10, 20, 30, 40]", "arr", "str")],
        [w("print", null, "fn"), w("("), w("nums", "nA"), w("["), w("3", "i3", "num"), w("])")],
        [w("print", null, "fn"), w("("), w("word", "wC"), w("["), w("1", "s1", "num"), w(":"), w("-1", "s2", "num"), w("])")],
        [w("print", null, "fn"), w("("), w("word", "wD"), w("["), w("::-1", "rev"), w("])")],
        [w("print", null, "fn"), w("("), w("len", "ln", "fn"), w("("), w("word", "wE"), w("))")]
      ],
      steps: [
        step("이름을 찾는다", "Find the name", "word라는 이름을 찾는다. 가리키는 값은 \"Python\"이다.", "The name word is found. It refers to \"Python\".", { line: 1, name: ["wA"] }),
        step("0은 첫 칸", "0 is the first cell", "번호는 0부터다. 0은 첫 칸이고 문자는 P다.", "Indexes start at 0. 0 is the first cell, and the character is P.", { line: 1, name: ["wA"], idx: ["i0"], lane: wordLane(0, "0, 그리고 그 칸의 P. 첫 번째다.", "0, and the P in that cell. It is the first character.") }),
        step("-1은 마지막", "-1 is the last cell", "음수는 뒤에서 센다. -1은 마지막 칸 n이다. 앞에서 세면 5번이기도 하다.", "A negative index counts from the back. -1 is the last cell, n. From the front that same cell is index 5.", { line: 2, name: ["wB"], idx: ["i1"], lane: wordLane(-1, "위는 0부터, 아래는 뒤에서 -1. 둘 다 n이다.", "The top row counts from 0. The bottom row counts -1 from the back. Both are n.") }),
        step("리스트 이름", "The list name", "nums를 찾는다. 칸은 10, 20, 30, 40 네 개다.", "nums is found. Its elements are 10, 20, 30, and 40.", { line: 4, name: ["nA"] }),
        step("3은 네 번째", "3 is the fourth cell", "0, 1, 2를 지나 3에 닿는다. 그래서 네 번째 칸이고 값은 40이다. 칸이 4개여도 마지막 번호는 3이다.", "Count 0, then 1, then 2, and 3 is the cell reached. It is the fourth cell, and the value is 40. Four elements still end at index 3.", { line: 4, name: ["nA"], idx: ["i3"], lane: lane("nums", "0, 1, 2를 지나 3. 노란 칸이 네 번째고 값은 40이다.", "Pass 0, 1, and 2 to reach 3. The yellow cell is the fourth, and the value is 40.", [[cell(0, 10, "in"), cell(1, 20, "in"), cell(2, 30, "in"), cell(3, 40, "hot")]]) }),
        step("슬라이스", "Slice", "시작 1은 포함하고, 끝 -1은 빠진다. -1은 n이므로 n 앞에서 멈춘다. 결과는 ytho다.", "Start 1 is included and stop -1 is excluded. -1 is n, so the slice stops before n. The result is ytho.", { line: 5, name: ["wC"], idx: ["s1", "s2"], lane: lane("word[1:-1]", "P는 시작 전이라 빠지고, n은 끝이라 빠진다. ytho만 남는다.", "P is before the start, so it is left out. n is the stop, so it is left out. ytho remains.", [[cell(0, "P", "out"), cell(1, "y", "hot"), cell(2, "t", "in"), cell(3, "h", "in"), cell(4, "o", "in"), cell(-1, "n", "out")]]) }),
        step("뒤집기", "Reverse", "[::-1]은 뒤에서 한 칸씩 온다. Python이 nohtyP가 된다. 원본 word는 그대로다.", "[::-1] walks one cell at a time from the back. Python becomes nohtyP. The original word is unchanged.", { line: 6, name: ["wD"], idx: ["rev"] }),
        step("len", "len", "len(word)는 칸의 개수 6이다. 마지막 번호는 6이 아니라 5다.", "len(word) is the count of cells, 6. The last index is 5, not 6.", { line: 7, name: ["wE"], out: ["ln"], lane: lane("len", "칸은 6개. 번호는 0부터 5까지다.", "There are 6 cells. The indexes run from 0 through 5.", [[cell(0, "P", "in"), cell(1, "y"), cell(2, "t"), cell(3, "h"), cell(4, "o"), cell(5, "n", "hot")]]) })
      ]
    },
    strings: {
      lines: [
        [w("s"), w(" = "), w('"Python"', null, "str")],
        [w("s", "sL"), w(" = "), w("s", "a"), w("["), w("-1", "m1", "num"), w("] + "), w("s", "b"), w("["), w("1", "sl", "num"), w(":"), w("-1", "sr", "num"), w("] + "), w("s", "c"), w("["), w("0", "z", "num"), w("]")],
        [w("parts"), w(" = "), w('"a,b"', "ab", "str"), w(".split("), w('","', "comma", "str"), w(")")],
        [w("joined"), w(" = "), w('"-"', "dash", "str"), w(".join("), w('"HELLO"', "hello", "str"), w(")")],
        [w("clean"), w(" = "), w('"a.b.c"', "dots", "str"), w(".replace("), w('"."', "dot", "str"), w(", "), w('""', "empty", "str"), w(")")],
        [w("low"), w(" = "), w('"Python"', "py", "str"), w(".lower()")]
      ],
      steps: [
        step("마지막 칸", "The last cell", "먼저 이름 s를 찾는다. -1은 뒤에서 첫 칸이라 n이다.", "The name s is found first. -1 is the first cell from the back, so the character is n.", { line: 1, name: ["a"], idx: ["m1"], lane: wordLane(-1, "위 줄에서 0부터 5까지 세면 마지막이 n이고, 아래 줄의 -1도 그 칸이다.", "On the top row, counting 0 through 5 lands on n. -1 on the bottom row is that same cell.") }),
        step("가운데 구간", "The middle span", "다시 s를 찾는다. 시작 1은 포함하고 끝 -1은 빠진다. n 앞에서 멈추므로 ytho다.", "The name s is found again. Start 1 is included and stop -1 is excluded. The slice stops before n, so the text is ytho.", { line: 1, name: ["b"], idx: ["sl", "sr"], lane: lane("s[1:-1]", "P는 시작 전이라 빠지고, n은 끝 번호라 빠진다.", "P is before the start, so it is left out. n is the stop, so it is left out.", [[cell(0, "P", "out"), cell(1, "y", "hot"), cell(2, "t", "in"), cell(3, "h", "in"), cell(4, "o", "in"), cell(-1, "n", "out")]]) }),
        step("첫 칸", "The first cell", "또 s를 찾는다. 0은 첫 칸이라 P다. 세 조각을 이어 nythoP가 되고, 왼쪽 s에 다시 넣어야 이름이 바뀐다.", "The name s is found once more. 0 is the first cell, so the character is P. The three pieces join as nythoP, and that result is stored back in the s on the left.", { line: 1, name: ["c"], idx: ["z"], out: ["sL"], lane: wordLane(0, "0이 첫 칸 P다. n + ytho + P 는 nythoP다.", "0 is the first cell, P. n + ytho + P is nythoP.") }),
        step("split", "split", "구분자 \",\"로 자른다. parts는 ['a', 'b']다. \"a,b\" 자체는 그대로다.", "The separator \",\" divides the string. parts is ['a', 'b']. \"a,b\" itself is unchanged.", { line: 2, name: ["ab"], idx: ["comma"] }),
        step("join", "join", "구분자는 메서드 앞의 \"-\"다. \"HELLO\"의 문자 사이에 끼워 H-E-L-L-O가 된다.", "The separator is the \"-\" in front of the method. It is placed between the characters of \"HELLO\", giving H-E-L-L-O.", { line: 3, name: ["hello"], idx: ["dash"], lane: lane("HELLO", "H, E, L, L, O 사이에 - 를 넣는다.", "A - is placed between H, E, L, L, and O.", [[cell(0, "H", "in"), cell(1, "E", "in"), cell(2, "L", "in"), cell(3, "L", "in"), cell(4, "O", "hot")]]) }),
        step("replace", "replace", "\".\"를 빈 문자열로 바꾼 새 문자열 abc를 반환한다. 다시 대입했으므로 clean이 abc다.", "A new string, abc, is returned, with \".\" replaced by an empty string. Because it is assigned, clean is abc.", { line: 4, name: ["dots"], idx: ["dot"], out: ["empty"] }),
        step("lower", "lower", "\"Python\"의 대문자를 소문자로 바꾼 새 문자열 python을 반환한다. 원래 글은 그대로다.", "A new string, python, is returned. The original text is unchanged.", { line: 5, name: ["py"] })
      ]
    },
    lists: {
      lines: [
        [w("lst"), w(" = "), w("[10, 20, 30]", "make")],
        [w("lst", "lstA"), w("["), w("1", "i1", "num"), w("]"), w(" = "), w("15", "v15", "num")],
        [w("lst", "lstB"), w(".append("), w("[3]", "ap"), w(")")],
        [w("a"), w(" = "), w("[1, 2]")],
        [w("a", "a1"), w(".extend("), w("[3, 4]", "ex"), w(")")],
        [w("b"), w(" = "), w("[1, 2]", "left"), w(" + "), w("[3]", "right")],
        [w("box"), w(" = "), w("[10, 20, 20]")],
        [w("box", "boxI"), w(".insert("), w("1", "ins", "num"), w(", 15)")],
        [w("box", "boxR"), w(".remove("), w("20", "rm", "num"), w(")")],
        [w("x"), w(" = "), w("box", "boxP"), w(".pop("), w("0", "popi", "num"), w(")")],
        [w("del ", null, "kw"), w("box", "boxD"), w("["), w("0", "deli", "num"), w("]")],
        [w("print", null, "fn"), w("([10, 20, 20].count("), w("20", "ct", "num"), w("))")],
        [w("print", null, "fn"), w("([10, 20, 30].index("), w("20", "ix", "num"), w("))")],
        [w("nums"), w(" = "), w("[3, 1, 2]", "ord")],
        [w("print", null, "fn"), w("("), w("sorted", "so", "fn"), w("("), w("nums", "ns"), w("))")],
        [w("nums", "ns2"), w(".sort()")],
        [w("nums", "ns3"), w(".reverse()")],
        [w("grid"), w(" = "), w("[[1, 2], [3, 4]]", "g0")],
        [w("print", null, "fn"), w("("), w("grid", "g1"), w("["), w("1", "go", "num"), w("]["), w("0", "gi", "num"), w("])")],
        [w("print", null, "fn"), w("("), w("sum", "sm", "fn"), w("([12000, 5500, 3200]))")],
        [w("print", null, "fn"), w("("), w("[1, 2]", "rep"), w(" * "), w("2", "twice", "num"), w(")")],
        [w("lowers"), w(" = "), w("[w.lower() for w in "), w('["Python", "Lab"]', "words", "str"), w("]")],
        [w("kept"), w(" = "), w("[c for c in "), w('"artificial"', "art", "str"), w(" if c not in "), w('"aeiou"', "vow", "str"), w("]")],
        [w("rows"), w(" = "), w("[[x, y] for x, y in "), w("zip", "zp", "fn"), w("("), w('["A", "B"]', "stu", "str"), w(", "), w("[90, 80, 70]", "grd", "str"), w(")]")]
      ],
      steps: [
        step("칸을 교체", "Replace a cell", "lst[1]의 1은 두 번째 칸이다. 20이 있던 자리를 15로 바꾼다. 리스트는 [10, 15, 30]이 된다.", "1 in lst[1] is the second cell. The 20 there becomes 15. The list is [10, 15, 30].", { line: 1, name: ["lstA"], idx: ["i1"], out: ["v15"], lane: lane("lst", "0은 10, 1은 20, 2는 30. 1번만 15로 바뀐다.", "0 is 10, 1 is 20, 2 is 30. Only index 1 becomes 15.", [[cell(0, 10), cell(1, 20, "hot"), cell(2, 30)]]) }),
        step("append", "append", "append는 [3] 전체를 마지막 칸 하나로 붙인다. 반환값은 None이다. 리스트 끝에 [3]이 한 칸으로 들어간다.", "append adds the whole [3] as one last element. The return value is None.", { line: 2, name: ["lstB"], idx: ["ap"] }),
        step("extend", "extend", "extend는 [3, 4]의 안을 풀어 3과 4를 따로 붙인다. a는 [1, 2, 3, 4]가 된다. 반환값은 None이다.", "extend unpacks [3, 4] and adds 3 and 4 separately. a becomes [1, 2, 3, 4]. The return value is None.", { line: 4, name: ["a1"], idx: ["ex"] }),
        step("+", "+", "[1, 2] + [3]은 새 리스트 [1, 2, 3]을 만든다. 양쪽 원본은 그대로다.", "[1, 2] + [3] builds a new list, [1, 2, 3]. Both originals stay as they were.", { line: 5, name: ["left", "right"] }),
        step("insert", "insert", "insert(1, 15)는 1번 자리에 15를 끼워 넣고 뒤를 민다. 반환값은 None이다.", "insert(1, 15) places 15 at index 1 and shifts the later elements. The return value is None.", { line: 7, name: ["boxI"], idx: ["ins"] }),
        step("remove", "remove", "remove(20)은 번호가 아니라 값 20의 첫 칸을 지운다. 반환값은 None이다.", "remove(20) deletes the first cell whose value is 20, not a numbered cell. The return value is None.", { line: 8, name: ["boxR"], idx: ["rm"] }),
        step("pop", "pop", "pop(0)은 0번, 즉 첫 칸을 빼고 그 값을 x에 돌려준다.", "pop(0) removes index 0, the first cell, and returns that value into x.", { line: 9, name: ["boxP"], idx: ["popi"], out: ["popi"] }),
        step("del", "del", "del은 문이므로 뺀 값을 돌려주지 않는다. 0번 칸만 지운다.", "del is a statement, so it does not return the removed value. It only deletes index 0.", { line: 10, name: ["boxD"], idx: ["deli"] }),
        step("count와 index", "count and index", "count(20)은 같은 칸의 개수라 없으면 0이다. index(20)은 첫 위치의 번호라 없으면 ValueError다.", "count(20) is a count, so a missing value is 0. index(20) is the first position, so a missing value raises ValueError.", { line: 11, idx: ["ct"] }),
        step("sorted와 sort", "sorted and sort", "sorted(nums)는 정렬된 새 리스트를 반환하고 nums는 [3, 1, 2] 그대로다. 다음 줄 sort는 nums 자체를 정렬하고 None을 반환한다.", "sorted(nums) returns a new sorted list and leaves nums as [3, 1, 2]. The next line, sort, orders nums itself and returns None.", { line: 14, name: ["ns"], out: ["so"] }),
        step("reverse", "reverse", "reverse는 크기 순이 아니라 현재 순서를 뒤집고 None을 반환한다.", "reverse flips the current order. It is not a sort by size, and it returns None.", { line: 16, name: ["ns3"] }),
        step("바깥 번호", "The outer index", "grid[1]의 1은 바깥에서 두 번째 칸이다. 그 칸의 값은 [3, 4]다.", "1 in grid[1] is the second outer cell. That cell's value is [3, 4].", { line: 18, name: ["g1"], idx: ["go"], lane: lane("grid", "0번 [1, 2], 1번 [3, 4]. 먼저 바깥 1을 고른다.", "Index 0 is [1, 2] and index 1 is [3, 4]. The outer 1 is chosen first.", [[cell(0, "[1, 2]"), cell(1, "[3, 4]", "hot")]]) }),
        step("안쪽 번호", "The inner index", "고른 [3, 4]에서 0은 첫 칸이다. 값은 3이다.", "Inside the chosen [3, 4], 0 is the first cell. The value is 3.", { line: 18, name: ["g1"], idx: ["gi"], lane: lane("[3, 4]", "0→3, 1→4. 0이 첫 칸이다.", "0 is 3 and 1 is 4. 0 is the first cell.", [[cell(0, 3, "hot"), cell(1, 4)]]) }),
        step("sum", "sum", "12000 + 5500 + 3200을 합해 20700을 반환한다. 리스트는 바뀌지 않는다.", "12000 + 5500 + 3200 is totaled as 20700. The list is unchanged.", { line: 19, out: ["sm"] }),
        step("*", "*", "[1, 2] * 2는 같은 칸을 두 번 둔 새 리스트 [1, 2, 1, 2]다. 원본은 그대로다.", "[1, 2] * 2 is a new list, [1, 2, 1, 2], with the same elements written twice. The original stays.", { line: 20, name: ["rep"], idx: ["twice"] }),
        step("컴프리헨션", "Comprehension", "words의 칸마다 lower를 적용해 새 리스트를 모은다. 결과는 ['python', 'lab']다.", "lower is applied to each element of words and the results are collected into a new list: ['python', 'lab'].", { line: 21, name: ["words"] }),
        step("조건", "A condition", "\"artificial\"의 문자를 앞에서부터 본다. a, e, i, o, u에 있으면 빼고, 없으면 남긴다. 결과는 rtfcl이다.", "Each character of \"artificial\" is tested from the front. A character in a, e, i, o, u is left out. The rest stay. The result is rtfcl.", { line: 22, name: ["art"], idx: ["vow"], lane: lane("artificial", "모음은 빠지고 r, t, f, c, l만 남는다.", "The vowels are left out. r, t, f, c, and l stay.", [[cell(0, "a", "out"), cell(1, "r", "in"), cell(2, "t", "in"), cell(3, "i", "out"), cell(4, "f", "hot"), cell(5, "i", "out"), cell(6, "c", "in"), cell(7, "i", "out"), cell(8, "a", "out"), cell(9, "l", "in")]]) }),
        step("zip", "zip", "학생은 2명이고 점수는 3개다. zip은 짧은 쪽이 끝나는 2쌍에서 멈춘다. 70은 짝이 없어 빠진다.", "There are 2 students and 3 grades. zip stops at the shorter side, after 2 pairs. 70 has no partner and is left out.", { line: 23, name: ["stu", "grd"], out: ["zp"], lane: lane("zip", "A-90, B-80까지만 쌍이 된다. 70은 남는다.", "The pairs stop at A-90 and B-80. 70 is left over.", [[cell(0, "A", "hot"), cell(1, "B", "in")], [cell(0, 90, "hot"), cell(1, 80, "in"), cell(2, 70, "out")]]) })
      ]
    },
    tuples: {
      lines: [
        [w("t"), w(" = "), w("(10, 20, 30)", "t0")],
        [w("print", null, "fn"), w("("), w("t", "tA"), w("["), w("0", "t0i", "num"), w("])")],
        [w("one"), w(" = "), w("(10,)", "one1")],
        [w("plain"), w(" = "), w("(10)", "plain1")],
        [w("edited"), w(" = "), w("list", "ls", "fn"), w("("), w("t", "tB"), w(")")],
        [w("edited", "ed"), w("["), w("0", "e0", "num"), w("]"), w(" = "), w("9", "nine", "num")],
        [w("t2"), w(" = "), w("tuple", "tu", "fn"), w("("), w("edited", "ed2"), w(")")],
        [w("nest"), w(" = "), w("((1, 2), (3, 4))", "nest0")],
        [w("print", null, "fn"), w("("), w("nest", "nA"), w("[1][0])")],
        [w("print", null, "fn"), w("("), w("t", "tS"), w("["), w(":2", "sl2"), w("])")],
        [w("print", null, "fn"), w("("), w("t", "tC"), w(".count("), w("20", "c20", "num"), w("))")],
        [w("longer"), w(" = "), w("t", "tP"), w(" + "), w("(40,)", "plus")]
      ],
      steps: [
        step("첫 칸", "The first cell", "t[0]의 0은 첫 칸이다. 값은 10이다. 튜플 칸은 이 자리에서 직접 바꾸지 못한다.", "0 in t[0] is the first cell. The value is 10. A tuple cell cannot be replaced here.", { line: 1, name: ["tA"], idx: ["t0i"], lane: lane("t", "0→10, 1→20, 2→30.", "0 is 10, 1 is 20, 2 is 30.", [[cell(0, 10, "hot"), cell(1, 20), cell(2, 30)]]) }),
        step("쉼표", "The comma", "(10,)만 길이 1인 튜플이다. (10)은 괄호만 있는 정수 10이다.", "Only (10,) is a tuple of length 1. (10) is the integer 10 in parentheses.", { line: 2, name: ["one1"], idx: ["plain1"] }),
        step("리스트로", "Through a list", "list(t)로 고칠 수 있는 리스트를 만든 뒤 0번을 9로 바꾼다. tuple로 다시 고정하면 t2는 (9, 20, 30)이다.", "list(t) makes an editable list, index 0 becomes 9, and tuple freezes it again. t2 is (9, 20, 30).", { line: 5, name: ["ed"], idx: ["e0"], out: ["nine"] }),
        step("중첩", "Nesting", "nest[1]은 두 번째 칸 (3, 4)다. 그 안의 [0]은 첫 값 3이다.", "nest[1] is the second cell, (3, 4). The [0] inside it is the first value, 3.", { line: 8, name: ["nA"], lane: lane("nest", "바깥 1을 고른 뒤, 그 튜플의 0을 고른다.", "Choose outer 1, then index 0 of that tuple.", [[cell(0, "(1, 2)"), cell(1, "(3, 4)", "hot")], [cell(0, 3, "hot"), cell(1, 4)]]) }),
        step("슬라이스", "Slice", "t[:2]는 0과 1만 담은 새 튜플 (10, 20)이다. 끝 번호 2는 빠진다. t는 그대로다.", "t[:2] is a new tuple, (10, 20), holding indexes 0 and 1. The stop 2 is excluded. t stays as it was.", { line: 9, name: ["tS"], idx: ["sl2"], lane: lane("t", "0과 1은 포함하고 2는 끝이라 빠진다.", "0 and 1 are included. 2 is the stop, so it is left out.", [[cell(0, 10, "in"), cell(1, 20, "hot"), cell(2, 30, "out")]]) }),
        step("count", "count", "t에서 20이 있는 칸을 센다. 1이다. 값이 없으면 0이고, 튜플은 바뀌지 않는다.", "The cells of t whose value is 20 are counted. The count is 1. A missing value would be 0, and the tuple is unchanged.", { line: 10, name: ["tC"], idx: ["c20"] }),
        step("+", "+", "t + (40,)는 뒤에 40을 붙인 새 튜플이다. 쉼표가 있어 (40,)는 튜플이다. t 자체는 그대로다.", "t + (40,) is a new tuple with 40 joined at the end. The comma makes (40,) a tuple. t itself stays as it was.", { line: 11, name: ["tP", "plus"] })
      ]
    },
    dicts: {
      lines: [
        [w("menu"), w(" = "), w('{"Burger": 5500}', "m0")],
        [w("menu", "m1"), w("["), w('"Pizza"', "pz", "str"), w("]"), w(" = "), w("8500", "price", "num")],
        [w("print", null, "fn"), w("("), w("menu", "m2"), w("["), w('"Burger"', "bg", "str"), w("])")],
        [w("del ", null, "kw"), w("menu", "m3"), w("["), w('"Burger"', "bg2", "str"), w("]")],
        [w("d"), w(" = "), w('{"major": "Math"}', "d0")],
        [w("print", null, "fn"), w("("), w('"major"', "k1", "str"), w(" in "), w("d", "d1"), w(")")],
        [w("print", null, "fn"), w("("), w('"Math"', "k2", "str"), w(" in "), w("d", "d2"), w(")")],
        [w("d", "d3"), w(".update("), w('{"a": 2}', "up"), w(")")],
        [w("print", null, "fn"), w("("), w("d", "d4"), w(".get("), w('"address"', "ad", "str"), w("))")],
        [w("status"), w(" = "), w('{"name": "Sungmin", "status": "active"}')],
        [w("print", null, "fn"), w("("), w("status", "st"), w(".pop("), w('"status"', "sk", "str"), w("))")],
        [w("person"), w(" = "), w('{"name": "Ada", "age": "20"}', "per")],
        [w("print", null, "fn"), w("("), w("list", "lk", "fn"), w("("), w("person", "pk"), w(".keys()))")],
        [w("print", null, "fn"), w("("), w("list", "lv", "fn"), w("("), w("person", "pv"), w(".values()))")],
        [w("print", null, "fn"), w("("), w("list", "li", "fn"), w("("), w("person", "pi"), w(".items()))")]
      ],
      steps: [
        step("없는 키에 대입", "Assign a new key", "Pizza는 아직 없다. menu[\"Pizza\"] = 8500은 그 키를 새로 만들고 값을 8500으로 둔다.", "Pizza is not there yet. menu[\"Pizza\"] = 8500 creates that key and sets the value to 8500.", { line: 1, name: ["m1"], idx: ["pz"], out: ["price"], lane: lane("menu", "Burger는 원래 키. Pizza는 이번 대입으로 추가된다.", "Burger is the original key. Pizza is added by this assignment.", [[cell("Burger", 5500, "in"), cell("Pizza", 8500, "hot")]]) }),
        step("있는 키를 읽기", "Read an existing key", "대괄호 안은 번호가 아니라 키다. Burger의 값 5500을 읽는다.", "The brackets hold a key, not an index. Burger's value, 5500, is read.", { line: 2, name: ["m2"], idx: ["bg"] }),
        step("del", "del", "del은 Burger 키와 그 값을 지운다. 지운 값은 반환되지 않는다.", "del removes the Burger key and its value. The removed value is not returned.", { line: 3, name: ["m3"], idx: ["bg2"] }),
        step("in은 키", "in looks at keys", "\"major\"는 키이므로 True다. 다음 줄 \"Math\"는 값이라 False다.", "\"major\" is a key, so True. On the next line \"Math\" is a value, so False.", { line: 5, name: ["d1"], idx: ["k1"], lane: lane("d", "키 major만 본다. 값 Math는 키가 아니다.", "Only the key major is inspected. The value Math is not a key.", [[cell("major", "Math", "hot"), cell("값", "Math", "out")]]) }),
        step("update", "update", "update는 {\"a\": 2}의 키를 d에 반영하고 None을 반환한다. 없던 a가 추가된다.", "update applies the keys of {\"a\": 2} to d and returns None. The new key a is added.", { line: 7, name: ["d3"], idx: ["up"] }),
        step("get", "get", "address 키는 없다. get은 KeyError 대신 None을 반환한다. d는 바뀌지 않는다.", "There is no address key. get returns None instead of raising KeyError. d is unchanged.", { line: 8, name: ["d4"], idx: ["ad"] }),
        step("pop", "pop", "pop(\"status\")는 키 status를 지우고, 지워진 값 active를 반환한다. 리스트 pop의 번호와 달리 인자는 키다.", "pop(\"status\") removes the key status and returns the removed value, active. Unlike list pop, the argument is a key, not an index.", { line: 10, name: ["st"], idx: ["sk"], lane: lane("status", "name은 남고, status 칸을 빼서 active를 돌려준다.", "name stays. The status pair is removed and active is returned.", [[cell("name", "Sungmin", "in"), cell("status", "active", "hot")]]) }),
        step("keys", "keys", "person의 키를 넣은 순서대로 꺼낸다. name 다음이 age다. 딕셔너리는 바뀌지 않는다.", "The keys of person are produced in insertion order: name, then age. The dictionary is unchanged.", { line: 12, name: ["pk"], out: ["lk"], lane: lane("person", "첫 키 name, 둘째 키 age.", "The first key is name and the second is age.", [[cell(0, "name", "hot"), cell(1, "age", "in")]]) }),
        step("values", "values", "값은 키와 같은 순서로 Ada, 그다음 20이다.", "The values follow the same order as the keys: Ada, then 20.", { line: 13, name: ["pv"], out: ["lv"], lane: lane("person", "name의 값 Ada, age의 값 20.", "name's value is Ada and age's value is 20.", [[cell("name", "Ada", "hot"), cell("age", "20", "in")]]) }),
        step("items", "items", "items는 (키, 값) 쌍이다. 첫 쌍은 (name, Ada)이고 둘째 쌍은 (age, 20)이다.", "items yields (key, value) pairs. The first pair is (name, Ada) and the second is (age, 20).", { line: 14, name: ["pi"], out: ["li"] })
      ]
    }
  };

  var titles = {
    io: ["통합 코드", "Combined code"],
    values: ["통합 코드", "Combined code"],
    convert: ["통합 코드", "Combined code"],
    ops: ["통합 코드", "Combined code"],
    loops: ["통합 코드", "Combined code"],
    indexing: ["통합 코드", "Combined code"],
    strings: ["통합 코드", "Combined code"],
    lists: ["통합 코드", "Combined code"],
    tuples: ["통합 코드", "Combined code"],
    dicts: ["통합 코드", "Combined code"]
  };

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ko";
  }

  function textOf(item, koKey, enKey) {
    return lang() === "en" ? item[enKey] : item[koKey];
  }

  function paint(root, walk, index) {
    var item = walk.steps[index];
    Array.prototype.forEach.call(root.querySelectorAll(".hl"), function (mark) {
      mark.classList.remove("is-name", "is-idx", "is-out");
    });
    Array.prototype.forEach.call(root.querySelectorAll(".line"), function (line) {
      line.classList.remove("is-line");
    });
    function markIds(ids, cls) {
      (ids || []).forEach(function (id) {
        var node = root.querySelector('.hl[data-id="' + id + '"]');
        if (node) node.classList.add(cls);
      });
    }
    markIds(item.name, "is-name");
    markIds(item.idx, "is-idx");
    markIds(item.out, "is-out");
    if (typeof item.line === "number") {
      var line = root.querySelector('.line[data-line="' + item.line + '"]');
      if (line) line.classList.add("is-line");
    }
    var laneBox = root.querySelector(".lane-box");
    laneBox.innerHTML = "";
    if (item.lane) {
      var box = document.createElement("div");
      box.className = "lane";
      var name = document.createElement("p");
      name.className = "lane-name";
      name.textContent = item.lane.name;
      box.appendChild(name);
      item.lane.rows.forEach(function (row) {
        var rowEl = document.createElement("div");
        rowEl.className = "lane-row";
        row.forEach(function (piece) {
          var cellEl = document.createElement("div");
          cellEl.className = "cell" + (piece.shade ? " is-" + piece.shade : "");
          var indexEl = document.createElement("span");
          indexEl.className = "cell-i";
          indexEl.textContent = piece.i;
          var valueEl = document.createElement("span");
          valueEl.className = "cell-v";
          valueEl.textContent = piece.v;
          cellEl.appendChild(indexEl);
          cellEl.appendChild(valueEl);
          rowEl.appendChild(cellEl);
        });
        box.appendChild(rowEl);
      });
      laneBox.appendChild(box);
    }
    root.querySelector(".step-title").textContent = textOf(item, "titleKo", "titleEn");
    root.querySelector(".step-note").textContent = textOf(item, "ko", "en");
    root.querySelector(".walk-count").textContent = (index + 1) + " / " + walk.steps.length;
    root.querySelector(".prev").disabled = index === 0;
    root.querySelector(".next").disabled = index === walk.steps.length - 1;
  }

  function build(mount, key) {
    var walk = WALKS[key];
    if (!walk) return;
    var current = 0;
    var root = document.createElement("section");
    root.className = "walk";
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "walk-toggle";
    toggle.setAttribute("aria-expanded", "false");
    var body = document.createElement("div");
    body.className = "walk-body";
    body.hidden = true;
    var pre = document.createElement("pre");
    pre.className = "walk-code";
    var code = document.createElement("code");
    walk.lines.forEach(function (line, lineIndex) {
      var lineEl = document.createElement("span");
      lineEl.className = "line";
      lineEl.setAttribute("data-line", String(lineIndex));
      line.forEach(function (token) {
        var span = document.createElement("span");
        span.textContent = token.t;
        if (token.k) span.className = "tok-" + token.k;
        if (token.id) {
          span.className = (span.className ? span.className + " " : "") + "hl";
          span.setAttribute("data-id", token.id);
        }
        lineEl.appendChild(span);
      });
      code.appendChild(lineEl);
    });
    pre.appendChild(code);
    var laneBox = document.createElement("div");
    laneBox.className = "lane-box";
    var stepTitle = document.createElement("p");
    stepTitle.className = "step-title";
    var stepNote = document.createElement("p");
    stepNote.className = "step-note";
    var nav = document.createElement("div");
    nav.className = "walk-nav";
    var prev = document.createElement("button");
    prev.type = "button";
    prev.className = "prev";
    var count = document.createElement("span");
    count.className = "walk-count";
    var next = document.createElement("button");
    next.type = "button";
    next.className = "next";
    prev.addEventListener("click", function () {
      if (current > 0) {
        current -= 1;
        paint(root, walk, current);
      }
    });
    next.addEventListener("click", function () {
      if (current < walk.steps.length - 1) {
        current += 1;
        paint(root, walk, current);
      }
    });
    nav.appendChild(prev);
    nav.appendChild(count);
    nav.appendChild(next);
    body.appendChild(pre);
    body.appendChild(laneBox);
    body.appendChild(stepTitle);
    body.appendChild(stepNote);
    body.appendChild(nav);
    toggle.addEventListener("click", function () {
      var open = body.hidden;
      body.hidden = !open;
      root.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    root.appendChild(toggle);
    root.appendChild(body);
    mount.appendChild(root);

    function relabel() {
      var ko = lang() !== "en";
      toggle.textContent = ko ? titles[key][0] : titles[key][1];
      prev.textContent = ko ? "이전" : "Previous";
      next.textContent = ko ? "다음" : "Next";
      paint(root, walk, current);
    }
    relabel();
    root._relabel = relabel;
  }

  Array.prototype.forEach.call(document.querySelectorAll(".walk-mount"), function (mount) {
    build(mount, mount.getAttribute("data-walk"));
  });

  var langButton = document.getElementById("lang-toggle");
  if (langButton) {
    langButton.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".walk"), function (root) {
        if (root._relabel) root._relabel();
      });
    });
  }
})();
