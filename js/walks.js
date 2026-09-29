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

  function cell(index, value, shade, to) {
    return { i: String(index), v: String(value), shade: shade || "", to: to || "" };
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
        [w("print", "pr", "fn"), w("("), w("\"b =\"", "s1", "str"), w(", "), w("float", "fl", "fn"), w("("), w("b", "b1"), w("))")],
        [w("text"), w(" = "), w("input", "inp", "fn"), w("(\"Enter a number: \")", "prompt", "str")],
        [w("n", "nL"), w(" = "), w("int", "intn", "fn"), w("("), w("text", "tx"), w(")")],
        [w("print", "pr2", "fn"), w("("), w("f\"n={n}\"", "fs", "str"), w(")")],
        [w("# print(\"skip\")", "cmt", "cmt")]
      ],
      steps: [
        step("b에 2를 넣는다", "Store 2 in b", "오른쪽 2를 계산해 이름 b에 연결한다. 아직 출력은 없다.", "The 2 on the right is bound to b. Nothing has been written yet.", { line: 0, name: ["n2"], lane: lane("b", "b는 정수 2다.", "b is the integer 2.", [[cell("b", "2", "hot", "")]]) }),
        step("print가 한 줄을 쓴다", "print writes one line", "float(b)는 2를 실수 2.0으로 바꾼 새 값이다. print는 쉼표 사이를 공백으로 구분해 b = 2.0을 출력하고 None을 반환한다.", "float(b) is a new float, 2.0. print writes b = 2.0, with a space between the arguments, and returns None.", { line: 1, name: ["pr", "fl", "b1"], out: ["s1"] }),
        step("input이 한 줄을 받는다", "input reads one line", "키보드에 4를 치면 text는 글자 \"4\"다. 정수 4가 아니다.", "Typing 4 makes text the characters \"4\", not the integer 4.", { line: 2, name: ["inp"], idx: ["prompt"] }),
        step("int가 정수로 바꾼다", "int builds an integer", "int(\"4\")는 정수 4를 반환한다. text는 여전히 문자열이다. n에 4를 넣는다.", "int(\"4\") returns the integer 4. text is still a string. n becomes 4.", { line: 3, name: ["tx", "nL"], out: ["intn"], lane: lane("n", "n은 정수 4다. text는 \"4\"로 남는다.", "n is the integer 4. text is still \"4\".", [[cell("n", "4", "hot", ""), cell("text", "\"4\"", "in", "")]]) }),
        step("f-string을 출력한다", "Print the f-string", "중괄호 안의 n을 먼저 계산한다. n이 4이므로 문자열은 \"n=4\"이고, print가 그 줄을 출력한다.", "The n inside the braces is evaluated first. n is 4, so the string is \"n=4\", and print writes that line.", { line: 4, name: ["fs"], out: ["pr2"] }),
        step("주석은 건너뛴다", "The comment is skipped", "# 부터 그 줄 끝은 실행되지 않는다. print(\"skip\")은 호출되지 않고, 터미널도 늘지 않는다.", "From # to the end of the line is not executed. print(\"skip\") is not called, and the terminal does not grow.", { line: 5, idx: ["cmt"] })
      ],
      terms: [
        [],
        ["b = 2.0"],
        ["b = 2.0", ">Enter a number: 4"],
        ["b = 2.0", ">Enter a number: 4"],
        ["b = 2.0", ">Enter a number: 4", "n=4"],
        ["b = 2.0", ">Enter a number: 4", "n=4"]
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
        step("n은 9", "n is 9", "오른쪽 9를 이름 n에 넣는다.", "The 9 on the right is bound to n.", { line: 0, name: ["nine"], lane: lane("n", "n은 정수 9다.", "n is the integer 9.", [[cell("n", "9", "hot", "")]]) }),
        step("n은 7이 된다", "n becomes 7", "오른쪽의 n은 아직 9다. 9 - 2인 7을 n에 다시 넣는다.", "The n on the right is still 9. 9 - 2 is 7, and that 7 is stored back in n.", { line: 1, name: ["nR", "two"], out: ["nL"], lane: lane("n", "계산 뒤 n은 7이다.", "After the calculation, n is 7.", [[cell("n", "7", "hot", "")]]) }),
        step("a와 b가 같은 2", "a and b share 2", "2를 한 번 계산하고, 그 값을 a와 b에 연결한다.", "2 is evaluated once, and that value is bound to both a and b.", { line: 2, name: ["both"], lane: lane("a, b", "a와 b는 둘 다 2다.", "Both a and b are 2.", [[cell("a", "2", "hot", ""), cell("b", "2", "in", "")]]) }),
        step("두 칸을 두 이름에 넣는다", "Two cells, two names", "왼쪽 이름은 두 개고 오른쪽 칸도 두 개다. 0번 Ada가 name, 1번 \"20\"이 age다. \"20\"은 글자다.", "The left side has two names and the right side has two cells. Cell 0, Ada, becomes name, and cell 1, \"20\", becomes age. \"20\" is text.", { line: 3, name: ["pair"], lane: lane("[\"Ada\", \"20\"]", "0이 첫 칸이다.", "0 is the first cell.", [[cell("0", "Ada", "hot", "→ name"), cell("1", "\"20\"", "in", "→ age")]]) }),
        step("type이 int를 출력한다", "type prints int", "지금 n은 7이다. type(n)은 int를 반환하고 print가 <class 'int'>를 출력한다.", "n is now 7. type(n) returns int, and print writes <class 'int'>.", { line: 4, name: ["nT"], out: ["ty", "pr"] })
      ],
      terms: [
        [],
        [],
        [],
        [],
        ["<class 'int'>"]
      ]
    },
    convert: {
      lines: [
        [w("print", null, "fn"), w("("), w("int", "i1", "fn"), w("("), w("9.9", "f99", "num"), w("))")],
        [w("print", null, "fn"), w("("), w("int", "i2", "fn"), w("("), w("\"9\"", "s9", "str"), w("))")],
        [w("print", null, "fn"), w("("), w("float", "fl", "fn"), w("("), w("2", "n2", "num"), w("))")],
        [w("print", null, "fn"), w("("), w("\"a = \"", "sa", "str"), w(" + "), w("str", "st", "fn"), w("("), w("1", "one", "num"), w("))")],
        [w("chars"), w(" = "), w("list", "ls", "fn"), w("("), w("\"ab\"", "ab", "str"), w(")")],
        [w("print", "pc", "fn"), w("("), w("chars", "ch"), w(")")],
        [w("pair"), w(" = "), w("tuple", "tu", "fn"), w("("), w("[1, 2]", "lst", "str"), w(")")],
        [w("print", "pp", "fn"), w("("), w("pair", "pr"), w(")")]
      ],
      steps: [
        step("9.9에서 소수점을 버린다", "Drop the fraction of 9.9", "int(9.9)는 9다. print가 9를 출력한다.", "int(9.9) is 9. print writes 9.", { line: 0, name: ["f99"], out: ["i1"] }),
        step("글자 9를 정수로 읽는다", "Read the character 9 as an integer", "int(\"9\")는 9다. \"9.0\"처럼 점이 있으면 int는 직접 받지 않는다.", "int(\"9\") is 9. int does not accept a string such as \"9.0\" directly.", { line: 1, name: ["s9"], out: ["i2"] }),
        step("2를 2.0으로 바꾼다", "Turn 2 into 2.0", "float(2)는 실수 2.0이다.", "float(2) is the float 2.0.", { line: 2, name: ["n2"], out: ["fl"] }),
        step("수를 글자로 붙인다", "Join a number as text", "str(1)이 \"1\"을 만든 뒤에 \"a = \"와 붙는다. 출력은 a = 1이다.", "str(1) makes \"1\", which is then joined to \"a = \". The output is a = 1.", { line: 3, name: ["one"], out: ["st", "sa"] }),
        step("글자를 칸으로 옮긴다", "Move characters into cells", "list(\"ab\")는 ['a', 'b']다. 0번이 a, 1번이 b다.", "list(\"ab\") is ['a', 'b']. Cell 0 is a and cell 1 is b.", { line: 4, name: ["ab"], out: ["ls"], lane: lane("\"ab\"", "글자 하나가 칸 하나다.", "Each character is one cell.", [[cell("0", "a", "hot", "chars[0]"), cell("1", "b", "in", "chars[1]")]]) }),
        step("chars를 출력한다", "Print chars", "print가 ['a', 'b']를 출력한다. \"ab\" 자체는 그대로다.", "print writes ['a', 'b']. The string \"ab\" itself is unchanged.", { line: 5, name: ["ch"], out: ["pc"] }),
        step("리스트를 튜플로 고정한다", "Freeze the list into a tuple", "tuple([1, 2])는 (1, 2)다. 만들어진 튜플의 칸은 대입으로 바꾸지 못한다.", "tuple([1, 2]) is (1, 2). Those cells cannot be replaced by assignment.", { line: 6, name: ["lst"], out: ["tu"] }),
        step("pair를 출력한다", "Print pair", "print가 (1, 2)를 출력한다.", "print writes (1, 2).", { line: 7, name: ["pr"], out: ["pp"] })
      ],
      terms: [
        ["9"],
        ["9", "9"],
        ["9", "9", "2.0"],
        ["9", "9", "2.0", "a = 1"],
        ["9", "9", "2.0", "a = 1"],
        ["9", "9", "2.0", "a = 1", "['a', 'b']"],
        ["9", "9", "2.0", "a = 1", "['a', 'b']"],
        ["9", "9", "2.0", "a = 1", "['a', 'b']", "(1, 2)"]
      ]
    },
    ops: {
      lines: [
        [w("x"), w(" = "), w("9.0", "x0", "num")],
        [w("print", null, "fn"), w("("), w("x", "xd"), w(" / "), w("2", "d2", "num"), w(")")],
        [w("print", null, "fn"), w("("), w("pow", "pw", "fn"), w("("), w("x", "xp"), w(", "), w("3", "p3", "num"), w("))")],
        [w("n"), w(" = "), w("4", "n4", "num")],
        [w("n", "nL"), w(" *= "), w("2 + 3", "rhs", "num")],
        [w("print", null, "fn"), w("("), w("n", "np"), w(")")],
        [w("print", null, "fn"), w("("), w("2 + 3 * 4", "prec"), w(")")],
        [w("print", null, "fn"), w("("), w("True and False", "bo"), w(")")],
        [w("print", null, "fn"), w("("), w("\"Py\"", "py", "str"), w(" in "), w("\"Python\"", "py2", "str"), w(")")]
      ],
      steps: [
        step("x는 9.0", "x is 9.0", "x에 실수 9.0을 넣는다. 출력은 아직 없다.", "The float 9.0 is stored in x. There is no output yet.", { line: 0, name: ["x0"], lane: lane("x", "x는 9.0이다.", "x is 9.0.", [[cell("x", "9.0", "hot", "")]]) }),
        step("9.0 / 2는 4.5", "9.0 / 2 is 4.5", "/ 는 실수 나눗셈이다. print가 4.5를 출력한다. x는 9.0 그대로다.", "/ is real division. print writes 4.5. x is still 9.0.", { line: 1, name: ["xd", "d2"] }),
        step("pow는 거듭제곱", "pow is exponentiation", "pow(x, 3)은 x ** 3과 같다. 9.0을 세 번 곱한 729.0이 출력된다.", "pow(x, 3) is the same as x ** 3. print writes 729.0, 9.0 multiplied by itself three times.", { line: 2, name: ["pw", "xp"], idx: ["p3"] }),
        step("n은 4", "n is 4", "다음 복합 대입에 쓸 4를 n에 넣는다.", "4 is stored in n for the next augmented assignment.", { line: 3, name: ["n4"] }),
        step("오른쪽을 먼저 계산한다", "The right side runs first", "2 + 3이 먼저 5가 된다. n *= 5는 n = n * 5라서 n은 20이 된다.", "2 + 3 becomes 5 first. n *= 5 is n = n * 5, so n becomes 20.", { line: 4, name: ["nL"], idx: ["rhs"], lane: lane("n", "4 * 5 = 20.", "4 * 5 = 20.", [[cell("n", "20", "hot", "")]]) }),
        step("n을 출력한다", "Print n", "print가 20을 출력한다.", "print writes 20.", { line: 5, name: ["np"] }),
        step("곱셈이 덧셈보다 먼저", "Multiplication precedes addition", "3 * 4가 먼저 12가 되고, 2 + 12는 14다. 괄호가 없으면 이 순서다.", "3 * 4 becomes 12 first, then 2 + 12 is 14. Without parentheses, that is the order.", { line: 6, idx: ["prec"] }),
        step("and는 양쪽이 참이어야 한다", "and needs both sides true", "True and False는 False다. 왼쪽이 거짓이면 오른쪽은 계산하지 않는다. 여기는 왼쪽이 참이라 오른쪽 False까지 본다.", "True and False is False. When the left side is false, the right side is not evaluated. Here the left side is true, so the right side, False, is read.", { line: 7, idx: ["bo"] }),
        step("\"Python\" 안에 \"Py\"", "\"Python\" contains \"Py\"", "연속된 \"Py\"가 있으므로 True다.", "The contiguous text \"Py\" is there, so the result is True.", { line: 8, name: ["py2"], idx: ["py"] })
      ],
      terms: [
        [],
        ["4.5"],
        ["4.5", "729.0"],
        ["4.5", "729.0"],
        ["4.5", "729.0"],
        ["4.5", "729.0", "20"],
        ["4.5", "729.0", "20", "14"],
        ["4.5", "729.0", "20", "14", "False"],
        ["4.5", "729.0", "20", "14", "False", "True"]
      ]
    },
    cond: {
      lines: [
        [w("number"), w(" = "), w("5", "five", "num")],
        [w("if ", null, "kw"), w("number < 0", "c1"), w(":")],
        [w("    print", null, "fn"), w("(\"negative\")", "neg", "str")],
        [w("elif ", null, "kw"), w("number == 0", "c2"), w(":")],
        [w("    print", null, "fn"), w("(\"zero\")", "z", "str")],
        [w("elif ", null, "kw"), w("number < 10", "c3"), w(":")],
        [w("    print", "ps", "fn"), w("(\"single\")", "sg", "str")],
        [w("else:", "el", "kw")],
        [w("    print", null, "fn"), w("(\"big\")", "bg", "str")],
        [w("if ", null, "kw"), w("number < 10", "c4"), w(":")],
        [w("    if ", null, "kw"), w("number % 2 == 0", "c5"), w(":")],
        [w("        print", null, "fn"), w("(\"even\")", "ev", "str")],
        [w("    else:", "el2", "kw")],
        [w("        print", "po", "fn"), w("(\"odd\")", "od", "str")]
      ],
      steps: [
        step("number는 5", "number is 5", "이후 조건은 모두 이 5를 본다.", "Every later condition looks at this 5.", { line: 0, name: ["five"], lane: lane("number", "number는 5다.", "number is 5.", [[cell("number", "5", "hot", "")]]) }),
        step("5 < 0은 거짓", "5 < 0 is false", "첫 if의 조건이 거짓이라 print(\"negative\")는 실행하지 않고 다음 elif로 간다.", "The first if is false, so print(\"negative\") does not run and control goes to the next elif.", { line: 1, idx: ["c1"] }),
        step("5 == 0은 거짓", "5 == 0 is false", "이 elif도 거짓이다. zero는 출력되지 않는다.", "This elif is also false. zero is not printed.", { line: 3, idx: ["c2"] }),
        step("5 < 10은 참", "5 < 10 is true", "이 갈래가 참이므로 본문으로 들어간다. 아래 else는 보지 않는다.", "This branch is true, so its body runs. The else below is not tested.", { line: 5, idx: ["c3"] }),
        step("single을 출력한다", "Print single", "print가 single을 출력한다. 같은 if의 else는 실행되지 않는다.", "print writes single. The else of this if does not run.", { line: 6, name: ["ps"], out: ["sg"] }),
        step("바깥 if가 참", "The outer if is true", "5 < 10이 다시 참이라 안쪽 if를 보러 들어간다.", "5 < 10 is true again, so control enters to test the inner if.", { line: 9, idx: ["c4"] }),
        step("5는 짝수가 아니다", "5 is not even", "5 % 2 == 0이 거짓이라 even은 출력하지 않고 안쪽 else로 간다.", "5 % 2 == 0 is false, so even is not printed and control goes to the inner else.", { line: 10, idx: ["c5"] }),
        step("odd를 출력한다", "Print odd", "안쪽 else가 실행되어 odd가 출력된다.", "The inner else runs and odd is printed.", { line: 13, name: ["po"], out: ["od"] })
      ],
      terms: [
        [],
        [],
        [],
        [],
        ["single"],
        ["single"],
        ["single"],
        ["single", "odd"]
      ]
    },
    modules: {
      lines: [
        [w("import ", null, "kw"), w("math", "m"), w(", "), w("random", "r")],
        [w("random.seed", "seed", "fn"), w("("), w("1", "one", "num"), w(")")],
        [w("print", null, "fn"), w("("), w("round", null, "fn"), w("("), w("math.pi", "pi"), w(", 2))")],
        [w("print", null, "fn"), w("("), w("round", null, "fn"), w("("), w("math.exp", "ex", "fn"), w("(1.0), 2))")],
        [w("print", null, "fn"), w("("), w("round", null, "fn"), w("("), w("random.uniform", "un", "fn"), w("(1, 10), 2))")]
      ],
      steps: [
        step("math와 random을 불러온다", "Load math and random", "import는 두 모듈의 이름을 이 프로그램에서 쓸 수 있게 한다. 아직 계산은 없다.", "import makes both module names available in this program. Nothing has been calculated yet.", { line: 0, name: ["m", "r"] }),
        step("같은 임의 수열로 고정한다", "Fix the random sequence", "random.seed(1)은 이후 uniform이 같은 프로그램에서 같은 값을 내게 한다. 시드가 없으면 실행마다 달라진다.", "random.seed(1) makes the later uniform call produce the same value in this program. Without a seed, each run can differ.", { line: 1, name: ["seed"], idx: ["one"] }),
        step("원주율을 소수 둘째 자리까지", "Pi to two decimal places", "math.pi를 소수 둘째 자리로 반올림하면 3.14다.", "Rounding math.pi to two decimal places yields 3.14.", { line: 2, name: ["pi"] }),
        step("e의 1제곱", "e to the power 1", "math.exp(1.0)은 e다. 소수 둘째 자리까지 보이면 2.72다.", "math.exp(1.0) is e. Shown to two decimal places, it is 2.72.", { line: 3, name: ["ex"] }),
        step("1 이상 10 미만의 실수", "A float from 1 up to 10", "random.uniform(1, 10)은 그 구간의 실수다. 이 시드에서는 소수 둘째 자리가 2.21이다.", "random.uniform(1, 10) is a float in that interval. With this seed, two decimal places show 2.21.", { line: 4, name: ["un"] })
      ],
      terms: [
        [],
        [],
        ["3.14"],
        ["3.14", "2.72"],
        ["3.14", "2.72", "2.21"]
      ]
    },
    loops: {
      lines: [
        [w("s"), w(" = "), w("\"Hi\"", "hi", "str")],
        [w("for ", null, "kw"), w("ch"), w(" in "), w("s", "sfor"), w(":")],
        [w("    print", "pch", "fn"), w("("), w("ch", "ch1"), w(")")],
        [w("for ", null, "kw"), w("n"), w(" in "), w("range", "rg", "fn"), w("(0, 5, 2):", "rng")],
        [w("    if ", null, "kw"), w("n == 0", "iz"), w(":")],
        [w("        continue", "ct", "kw")],
        [w("    if ", null, "kw"), w("n == 4", "ifour"), w(":")],
        [w("        break", "br", "kw")],
        [w("    print", "pn", "fn"), w("("), w("n", "nv"), w(")")],
        [w("k"), w(" = "), w("0", "k0", "num")],
        [w("while ", null, "kw"), w("k < 2", "cond"), w(":")],
        [w("    k", "kL"), w(" = "), w("k + 1", "kadd")],
        [w("else:", "els", "kw")],
        [w("    print", "pk", "fn"), w("("), w("k", "kv"), w(")")],
        [w("for ", null, "kw"), w("i, ch"), w(" in "), w("enumerate", "en", "fn"), w("(\"Ab\"):", "ab", "str")],
        [w("    print", "pe", "fn"), w("("), w("i, ch", "pair"), w(")")]
      ],
      steps: [
        step("s는 \"Hi\"", "s is \"Hi\"", "두 글자 H, i가 반복의 묶음이 된다.", "The two characters H and i become the sequence of the loop.", { line: 0, name: ["hi"], lane: lane("\"Hi\"", "0이 첫 칸이다.", "0 is the first cell.", [[cell("0", "H", "hot", "→ ch"), cell("1", "i", "in", "→ ch")]]) }),
        step("ch는 H", "ch is H", "첫 칸 0의 H를 ch에 넣고 본문으로 들어간다.", "H in cell 0 is bound to ch, and the body runs.", { line: 1, name: ["sfor"], lane: lane("ch", "이번 반복의 ch는 H다.", "ch is H on this iteration.", [[cell("0", "H", "hot", "→ ch")]]) }),
        step("H를 출력한다", "Print H", "print(ch)가 H를 출력한 뒤 for로 돌아간다.", "print(ch) writes H, then control returns to the for.", { line: 2, name: ["ch1"], out: ["pch"] }),
        step("ch는 i", "ch is i", "다음 칸 1의 i를 ch에 넣는다.", "i in cell 1 is bound to ch.", { line: 1, name: ["sfor"], lane: lane("ch", "이번 반복의 ch는 i다.", "ch is i on this iteration.", [[cell("1", "i", "hot", "→ ch")]]) }),
        step("i를 출력한다", "Print i", "print(ch)가 i를 출력하고, \"Hi\"의 칸이 끝났으므로 이 for는 끝난다.", "print(ch) writes i. The cells of \"Hi\" are finished, so this for ends.", { line: 2, name: ["ch1"], out: ["pch"] }),
        step("n은 0", "n is 0", "range(0, 5, 2)는 0, 2, 4다. 끝 5는 빠지고 간격은 2다. 첫 값은 0이다.", "range(0, 5, 2) is 0, 2, 4. The stop 5 is excluded and the step is 2. The first value is 0.", { line: 3, name: ["rg"], idx: ["rng"], lane: lane("range(0, 5, 2)", "5는 포함되지 않는다.", "5 is not included.", [[cell("0", "0", "hot", "→ n"), cell("2", "2", "in", "→ n"), cell("4", "4", "in", "→ n"), cell("빠짐", "5", "out", "")]]) }),
        step("0이면 continue", "continue when n is 0", "n == 0이 참이라 continue가 이번 본문의 나머지를 건너뛴다. 0은 출력되지 않는다.", "n == 0 is true, so continue skips the rest of this body. 0 is not printed.", { line: 4, idx: ["iz"], out: ["ct"] }),
        step("n은 2", "n is 2", "다음 값은 2다. 0이 아니므로 continue에 걸리지 않는다.", "The next value is 2. It is not 0, so continue does not apply.", { line: 3, name: ["rg"] }),
        step("2는 4가 아니다", "2 is not 4", "n == 4가 거짓이라 break는 실행되지 않고 print로 간다.", "n == 4 is false, so break does not run and control reaches print.", { line: 6, idx: ["ifour"] }),
        step("2를 출력한다", "Print 2", "print(n)이 2를 출력한다.", "print(n) writes 2.", { line: 8, name: ["nv"], out: ["pn"] }),
        step("n은 4, break", "n is 4, break", "다음 값은 4다. n == 4가 참이라 break가 이 for를 즉시 끝낸다. 4는 출력되지 않는다.", "The next value is 4. n == 4 is true, so break ends this for immediately. 4 is not printed.", { line: 3, out: ["br"] }),
        step("k는 0", "k is 0", "while에 들어가기 전에 k를 0으로 둔다.", "k is set to 0 before the while.", { line: 9, name: ["k0"], lane: lane("k", "k는 0이다.", "k is 0.", [[cell("k", "0", "hot", "")]]) }),
        step("0 < 2라서 본문으로", "0 < 2, so enter the body", "조건이 참이라 본문을 실행한다.", "The condition is true, so the body runs.", { line: 10, idx: ["cond"] }),
        step("k는 1", "k becomes 1", "k + 1을 k에 다시 넣고 조건을 다시 보러 올라간다.", "k + 1 is stored back in k, then the condition is tested again.", { line: 11, name: ["kL"], idx: ["kadd"], lane: lane("k", "k는 1이다.", "k is 1.", [[cell("k", "1", "hot", "")]]) }),
        step("k는 2", "k becomes 2", "1 < 2가 아직 참이라 본문을 한 번 더 실행한다. k는 2가 된다.", "1 < 2 is still true, so the body runs once more. k becomes 2.", { line: 11, name: ["kL"], lane: lane("k", "k는 2다.", "k is 2.", [[cell("k", "2", "hot", "")]]) }),
        step("2 < 2는 거짓", "2 < 2 is false", "조건이 거짓이 되어 반복이 평범하게 끝난다. break로 끝난 것이 아니라서 else로 간다.", "The condition is false, so the loop ends normally. It did not end with break, so control goes to else.", { line: 10, idx: ["cond"] }),
        step("else가 k를 출력한다", "else prints k", "print(k)가 2를 출력한다.", "print(k) writes 2.", { line: 13, name: ["kv"], out: ["pk"] }),
        step("번호 0과 A", "Index 0 and A", "enumerate(\"Ab\")의 첫 쌍은 (0, A)다. 번호는 0부터 시작한다.", "The first pair from enumerate(\"Ab\") is (0, A). The index starts at 0.", { line: 14, name: ["en"], idx: ["ab"], lane: lane("enumerate", "위는 번호, 가운데는 글자다.", "The top is the index and the middle is the character.", [[cell("0", "A", "hot", "→ i, ch"), cell("1", "b", "in", "→ i, ch")]]) }),
        step("0 A를 출력한다", "Print 0 A", "print(i, ch)가 0 A를 출력한다.", "print(i, ch) writes 0 A.", { line: 15, name: ["pair"], out: ["pe"] }),
        step("번호 1과 b", "Index 1 and b", "다음 쌍은 (1, b)다. 칸이 끝났으므로 이 다음 반복은 없다.", "The next pair is (1, b). The cells are finished, so there is no further iteration.", { line: 14, name: ["en"] }),
        step("1 b를 출력한다", "Print 1 b", "print가 1 b를 출력하고 프로그램이 끝난다.", "print writes 1 b, and the program ends.", { line: 15, name: ["pair"], out: ["pe"] })
      ],
      terms: [
        [],
        [],
        ["H"],
        ["H"],
        ["H", "i"],
        ["H", "i"],
        ["H", "i"],
        ["H", "i"],
        ["H", "i"],
        ["H", "i", "2"],
        ["H", "i", "2"],
        ["H", "i", "2"],
        ["H", "i", "2"],
        ["H", "i", "2"],
        ["H", "i", "2"],
        ["H", "i", "2"],
        ["H", "i", "2", "2"],
        ["H", "i", "2", "2"],
        ["H", "i", "2", "2", "0 A"],
        ["H", "i", "2", "2", "0 A"],
        ["H", "i", "2", "2", "0 A", "1 b"]
      ]
    },
    indexing: {
      lines: [
        [w("word"), w(" = "), w("\"Python\"", "w0", "str")],
        [w("print", null, "fn"), w("("), w("word", "wA"), w("["), w("0", "i0", "num"), w("])")],
        [w("print", null, "fn"), w("("), w("word", "wB"), w("["), w("-1", "i1", "num"), w("])")],
        [w("nums"), w(" = "), w("[10, 20, 30, 40]", "arr")],
        [w("print", null, "fn"), w("("), w("nums", "nA"), w("["), w("3", "i3", "num"), w("])")],
        [w("print", null, "fn"), w("("), w("word", "wC"), w("["), w("1:-1", "sl"), w("])")],
        [w("print", null, "fn"), w("("), w("len", "ln", "fn"), w("("), w("word", "wE"), w("))")]
      ],
      steps: [
        step("word는 \"Python\"", "word is \"Python\"", "여섯 글자를 word에 넣는다. 번호는 0부터 5까지다.", "Six characters are stored in word. The indexes run from 0 through 5.", { line: 0, name: ["w0"], lane: lane("word", "칸은 6개. 마지막 번호는 5다.", "There are 6 cells. The last index is 5.", [[cell("0", "P", "in", ""), cell("1", "y", "", ""), cell("2", "t", "", ""), cell("3", "h", "", ""), cell("4", "o", "", ""), cell("5", "n", "hot", "")]]) }),
        step("0은 첫 칸 P", "0 is the first cell, P", "이름을 찾은 뒤 번호 0을 본다. 0은 첫 칸이고 문자는 P다. print가 P를 출력한다.", "The name is found, then index 0 is read. 0 is the first cell and the character is P. print writes P.", { line: 1, name: ["wA"], idx: ["i0"], lane: lane("word[0]", "0이 첫 칸이다.", "0 is the first cell.", [[cell("0", "P", "hot", ""), cell("1", "y", "in", ""), cell("2", "t", "", ""), cell("3", "h", "", ""), cell("4", "o", "", ""), cell("5", "n", "", "")]]) }),
        step("-1은 마지막 n", "-1 is the last cell, n", "음수는 뒤에서 센다. -1은 n이다. print가 n을 출력한다.", "A negative index counts from the back. -1 is n. print writes n.", { line: 2, name: ["wB"], idx: ["i1"], lane: lane("word[-1]", "앞에서 세면 5번, 뒤에서 세면 -1이다.", "From the front this cell is 5. From the back it is -1.", [[cell("5", "n", "hot", ""), cell("-1", "n", "in", "")]]) }),
        step("nums는 네 칸", "nums has four cells", "10, 20, 30, 40을 nums에 넣는다.", "10, 20, 30, and 40 are stored in nums.", { line: 3, name: ["arr"], lane: lane("nums", "칸이 4개여도 마지막 번호는 3이다.", "Four cells still end at index 3.", [[cell("0", "10", "in", "1번째"), cell("1", "20", "in", "2번째"), cell("2", "30", "in", "3번째"), cell("3", "40", "hot", "4번째")]]) }),
        step("3은 네 번째 칸 40", "3 is the fourth cell, 40", "0, 1, 2 다음이 3이므로 네 번째 칸이다. print가 40을 출력한다.", "3 comes after 0, 1, and 2, so it is the fourth cell. print writes 40.", { line: 4, name: ["nA"], idx: ["i3"] }),
        step("1부터 -1 직전까지", "From 1 up to -1", "시작 1은 포함하고 끝 -1은 빠진다. n 앞에서 멈추므로 ytho가 출력된다.", "Start 1 is included and stop -1 is excluded. The slice stops before n, so ytho is printed.", { line: 5, name: ["wC"], idx: ["sl"], lane: lane("word[1:-1]", "P는 시작 전이라 빠지고, n은 끝이라 빠진다.", "P is before the start. n is the stop, so it is left out.", [[cell("0", "P", "out", ""), cell("1", "y", "hot", ""), cell("2", "t", "in", ""), cell("3", "h", "in", ""), cell("4", "o", "in", ""), cell("-1", "n", "out", "")]]) }),
        step("len은 칸의 개수", "len is the number of cells", "len(word)는 6이다. 마지막 번호는 6이 아니라 5다.", "len(word) is 6. The last index is 5, not 6.", { line: 6, name: ["wE"], out: ["ln"] })
      ],
      terms: [
        [],
        ["P"],
        ["P", "n"],
        ["P", "n"],
        ["P", "n", "40"],
        ["P", "n", "40", "ytho"],
        ["P", "n", "40", "ytho", "6"]
      ]
    },
    strings: {
      lines: [
        [w("s"), w(" = "), w("\"  Python  \"", "raws", "str")],
        [w("s", "sL"), w(" = "), w("s.strip()", "st")],
        [w("print", null, "fn"), w("("), w("s.lower()", "low"), w(")")],
        [w("print", null, "fn"), w("("), w("\"a.b\".replace(\".\", \"\")", "rp"), w(")")],
        [w("print", null, "fn"), w("("), w("\"-\".join(\"AB\")", "jn"), w(")")],
        [w("print", null, "fn"), w("("), w("\"a,b,c\".split(\",\", 1)", "sp"), w(")")],
        [w("print", null, "fn"), w("("), w("\"Pi = {:.2f}\".format(3.14159)", "fm"), w(")")]
      ],
      steps: [
        step("양끝에 공백이 있다", "There are spaces at both ends", "s는 공백, Python, 공백이다. 가운데 글자는 아직 그대로다.", "s is spaces, then Python, then spaces. The letters in the middle are still as written.", { line: 0, name: ["raws"] }),
        step("strip이 끝을 뺀다", "strip removes the ends", "strip은 양쪽 공백을 뺀 새 문자열 Python을 반환한다. 그 결과를 s에 다시 넣어야 이름이 바뀐다. 원래 글의 가운데는 건드리지 않는다.", "strip returns a new string, Python, with the spaces at both ends removed. That result has to be stored back in s. The letters in the middle are untouched.", { line: 1, name: ["st"], out: ["sL"], lane: lane("s", "공백이 빠지고 Python이 남는다.", "The spaces are removed and Python remains.", [[cell("s", "Python", "hot", "")]]) }),
        step("lower가 소문자를 출력한다", "lower prints lowercase", "s.lower()는 python이라는 새 문자열이다. s 자체는 Python으로 남는다. print가 python을 출력한다.", "s.lower() is a new string, python. s itself remains Python. print writes python.", { line: 2, name: ["low"] }),
        step("replace가 점을 지운다", "replace removes the dots", "\".\"를 빈 문자열로 바꾼 새 문자열 ab가 출력된다.", "A new string, ab, is printed, with \".\" replaced by an empty string.", { line: 3, name: ["rp"] }),
        step("join이 사이에 끼운다", "join places the separator between", "구분자는 앞의 \"-\"다. A와 B 사이에 끼워 A-B가 출력된다.", "The separator is the \"-\" in front. It is placed between A and B, and A-B is printed.", { line: 4, name: ["jn"], lane: lane("AB", "글자 사이에 - 를 넣는다.", "A - is placed between the characters.", [[cell("0", "A", "in", ""), cell("1", "B", "hot", "")]]) }),
        step("한 번만 자른다", "Split only once", "maxsplit이 1이라 첫 쉼표에서만 자른다. ['a', 'b,c']가 출력된다.", "maxsplit is 1, so only the first comma is a split. ['a', 'b,c'] is printed.", { line: 5, name: ["sp"] }),
        step("소수 둘째 자리로 맞춘다", "Two digits after the decimal point", "{:.2f}는 소수점 아래 두 자리로 반올림한다. Pi = 3.14가 출력된다.", "{:.2f} rounds to two digits after the decimal point. Pi = 3.14 is printed.", { line: 6, name: ["fm"] })
      ],
      terms: [
        [],
        [],
        ["python"],
        ["python", "ab"],
        ["python", "ab", "A-B"],
        ["python", "ab", "A-B", "['a', 'b,c']"],
        ["python", "ab", "A-B", "['a', 'b,c']", "Pi = 3.14"]
      ]
    },
    funcs: {
      lines: [
        [w("global_variable", "g"), w(" = "), w("\"ccc\"", "ccc", "str")],
        [w("def ", null, "kw"), w("my_function", "fnm"), w("():")],
        [w("    local_variable", "loc"), w(" = "), w("\"abc\"", "abc", "str")],
        [w("    print", "pg", "fn"), w("("), w("global_variable", "gr"), w(")")],
        [w("    return ", null, "kw"), w("local_variable", "ret")],
        [w("print", "pc", "fn"), w("("), w("my_function()", "call"), w(")")]
      ],
      steps: [
        step("전역 이름에 ccc", "The global name holds ccc", "함수 밖에서 만든 global_variable은 전역 이름이다. 값은 ccc다.", "global_variable, created outside the function, is a global name. Its value is ccc.", { line: 0, name: ["g"], idx: ["ccc"], lane: lane("global_variable", "함수 밖에서도 이 이름이 보인다.", "This name is visible outside the function too.", [[cell("global", "ccc", "hot", "")]]) }),
        step("함수를 만들기만 한다", "The function is only created", "def는 my_function이라는 함수를 만든다. 이 줄에서는 본문이 실행되지 않는다.", "def creates the function my_function. The body does not run on this line.", { line: 1, name: ["fnm"] }),
        step("호출이 본문으로 들어간다", "The call enters the body", "print의 인자 my_function()을 계산하려고 함수 본문으로 들어간다.", "Evaluating the argument my_function() enters the function body.", { line: 5, name: ["call"], out: ["pc"] }),
        step("지역 이름 abc", "The local name abc", "함수 안에서 대입한 local_variable은 이 함수의 지역 이름이다. 밖에서는 이 이름이 보이지 않는다.", "local_variable, assigned inside the function, is local to this function. That name is not visible outside.", { line: 2, name: ["loc"], idx: ["abc"], lane: lane("local_variable", "이 이름은 함수가 끝나면 밖에서 읽을 수 없다.", "This name cannot be read outside after the function ends.", [[cell("local", "abc", "hot", "")]]) }),
        step("전역 값을 읽는다", "Read the global value", "함수 안에서 global_variable을 읽기만 하므로 전역 값 ccc가 출력된다.", "The function only reads global_variable, so the global value ccc is printed.", { line: 3, name: ["gr"], out: ["pg"] }),
        step("abc를 돌려준다", "Return abc", "return이 지역 값 abc를 호출한 곳으로 돌려주고 함수를 끝낸다.", "return sends the local value abc back to the caller and ends the function.", { line: 4, name: ["ret"] }),
        step("print가 abc를 출력한다", "print writes abc", "호출 결과가 abc이므로 print가 abc를 출력한다.", "The call's result is abc, so print writes abc.", { line: 5, name: ["call"], out: ["pc"] })
      ],
      terms: [
        [],
        [],
        [],
        [],
        ["ccc"],
        ["ccc"],
        ["ccc", "abc"]
      ]
    },
    lists: {
      lines: [
        [w("box"), w(" = "), w("[10, 20, 30]", "make")],
        [w("box", "b1"), w("["), w("1", "i1", "num"), w("] = "), w("15", "v15", "num")],
        [w("box.append", "ap", "fn"), w("("), w("40", "v40", "num"), w(")")],
        [w("box", "b2"), w(" += "), w("[50]", "ex")],
        [w("box.insert", "ins", "fn"), w("("), w("0, 5", "at"), w(")")],
        [w("box.remove", "rm", "fn"), w("("), w("15", "vrm", "num"), w(")")],
        [w("x", "xL"), w(" = "), w("box.pop()", "pop")],
        [w("other"), w(" = "), w("box.copy()", "cp")],
        [w("box.sort", "so", "fn"), w("("), w("reverse=True", "rev"), w(")")],
        [w("print", "p1", "fn"), w("("), w("box", "bx"), w(")")],
        [w("print", "p2", "fn"), w("("), w("other", "ot"), w(")")]
      ],
      steps: [
        step("box는 세 칸", "box has three cells", "[10, 20, 30]을 box에 넣는다. 번호는 0, 1, 2다.", "[10, 20, 30] is stored in box. The indexes are 0, 1, and 2.", { line: 0, name: ["make"], lane: lane("box", "0이 첫 칸이다.", "0 is the first cell.", [[cell("0", "10", "in", ""), cell("1", "20", "in", ""), cell("2", "30", "hot", "")]]) }),
        step("1번 칸을 15로 바꾼다", "Replace cell 1 with 15", "번호 1은 두 번째 칸이다. 20이 15가 되고 box는 [10, 15, 30]이다.", "Index 1 is the second cell. 20 becomes 15, and box is [10, 15, 30].", { line: 1, name: ["b1"], idx: ["i1"], out: ["v15"], lane: lane("box", "1번 칸만 바뀐다.", "Only cell 1 changes.", [[cell("0", "10", "in", ""), cell("1", "15", "hot", ""), cell("2", "30", "in", "")]]) }),
        step("40을 한 칸으로 붙인다", "Append 40 as one cell", "append는 40을 끝에 한 칸으로 더하고 None을 반환한다. box는 [10, 15, 30, 40]이다.", "append adds 40 as one cell at the end and returns None. box is [10, 15, 30, 40].", { line: 2, name: ["ap"], idx: ["v40"], lane: lane("box", "40이 마지막 칸이다.", "40 is the last cell.", [[cell("0", "10", "", ""), cell("1", "15", "", ""), cell("2", "30", "", ""), cell("3", "40", "hot", "")]]) }),
        step("+= 가 50을 푼다", "+= unpacks 50", "리스트의 += 는 extend와 같이 오른쪽 칸을 하나씩 붙인다. box는 [10, 15, 30, 40, 50]이다.", "On a list, += works like extend and appends each element on the right. box is [10, 15, 30, 40, 50].", { line: 3, name: ["b2"], idx: ["ex"], lane: lane("box", "50이 끝에 붙었다.", "50 was appended at the end.", [[cell("3", "40", "in", ""), cell("4", "50", "hot", "")]]) }),
        step("0번에 5를 끼운다", "Insert 5 at index 0", "insert(0, 5)는 첫 칸 앞에 5를 넣고 뒤를 민다. 반환은 None이다.", "insert(0, 5) places 5 in front of the first cell and shifts the rest. The return value is None.", { line: 4, name: ["ins"], idx: ["at"], lane: lane("box", "5가 새 0번이다.", "5 is the new cell 0.", [[cell("0", "5", "hot", ""), cell("1", "10", "in", "")]]) }),
        step("값 15를 지운다", "Delete the value 15", "remove(15)는 번호가 아니라 값이 15인 첫 칸을 지운다. 반환은 None이다.", "remove(15) deletes the first cell whose value is 15, not a chosen index. The return value is None.", { line: 5, name: ["rm"], idx: ["vrm"] }),
        step("pop이 마지막 50을 뺀다", "pop removes the last 50", "인자가 없는 pop()은 마지막 칸을 빼서 그 값을 반환한다. x는 50이고 box는 [5, 10, 30, 40]이다.", "pop() with no argument removes the last cell and returns that value. x is 50, and box is [5, 10, 30, 40].", { line: 6, name: ["pop"], out: ["xL"], lane: lane("x, box", "뺀 값은 x로 가고, box에서는 빠진다.", "The removed value goes to x and leaves box.", [[cell("x", "50", "hot", ""), cell("box", "[5, 10, 30, 40]", "in", "")]]) }),
        step("copy는 바깥만 새로 만든다", "copy builds a new outer list", "other는 box와 다른 리스트다. 지금 칸의 값은 같다. 이후 box를 정렬해도 other는 이 순서를 유지한다.", "other is a different list from box. The cell values match right now. Sorting box later leaves other in this order.", { line: 7, name: ["cp"], lane: lane("other", "사본은 [5, 10, 30, 40]이다.", "The copy is [5, 10, 30, 40].", [[cell("0", "5", "in", ""), cell("1", "10", "", ""), cell("2", "30", "", ""), cell("3", "40", "hot", "")]]) }),
        step("내림차순으로 정렬한다", "Sort descending", "sort(reverse=True)는 box를 그 자리에서 큰 수부터 정렬하고 None을 반환한다. box는 [40, 30, 10, 5]다.", "sort(reverse=True) sorts box in place from the largest number and returns None. box is [40, 30, 10, 5].", { line: 8, name: ["so"], idx: ["rev"], lane: lane("box", "큰 수부터 정렬됐다.", "The larger numbers come first.", [[cell("0", "40", "hot", ""), cell("1", "30", "in", ""), cell("2", "10", "", ""), cell("3", "5", "", "")]]) }),
        step("정렬된 box를 출력한다", "Print the sorted box", "print가 [40, 30, 10, 5]를 출력한다.", "print writes [40, 30, 10, 5].", { line: 9, name: ["bx"], out: ["p1"] }),
        step("사본은 정렬 전 순서", "The copy keeps the earlier order", "other는 정렬 전의 [5, 10, 30, 40]이다. print가 그 리스트를 출력한다.", "other is still [5, 10, 30, 40] from before the sort. print writes that list.", { line: 10, name: ["ot"], out: ["p2"] })
      ],
      terms: [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        ["[40, 30, 10, 5]"],
        ["[40, 30, 10, 5]", "[5, 10, 30, 40]"]
      ]
    },
    tuples: {
      lines: [
        [w("one"), w(" = "), w("(10,)", "onev")],
        [w("plain"), w(" = "), w("(10)", "plainv", "num")],
        [w("print", null, "fn"), w("("), w("one", "o1"), w(")")],
        [w("print", null, "fn"), w("("), w("plain", "p1"), w(")")],
        [w("a"), w(", "), w("*b"), w(" = "), w("[1, 2, 3, 4]", "src")],
        [w("print", null, "fn"), w("("), w("a", "a1"), w(")")],
        [w("print", null, "fn"), w("("), w("b", "b1"), w(")")]
      ],
      steps: [
        step("쉼표가 있어야 튜플", "The comma makes the tuple", "(10,)는 값이 하나인 튜플이다. 쉼표가 튜플을 만든다.", "(10,) is a one-element tuple. The comma is what makes it a tuple.", { line: 0, name: ["onev"], lane: lane("one", "칸이 하나인 튜플이다.", "A tuple with one cell.", [[cell("0", "10", "hot", "")]]) }),
        step("괄호만 있으면 정수", "Parentheses alone are an integer", "(10)은 10을 괄호로 묶은 정수다. plain은 튜플이 아니다.", "(10) is the integer 10 wrapped in parentheses. plain is not a tuple.", { line: 1, name: ["plainv"], lane: lane("plain", "plain은 정수 10이다.", "plain is the integer 10.", [[cell("plain", "10", "hot", "")]]) }),
        step("(10,)를 출력한다", "Print (10,)", "print가 (10,)를 출력한다.", "print writes (10,).", { line: 2, name: ["o1"] }),
        step("10을 출력한다", "Print 10", "print가 정수 10을 출력한다.", "print writes the integer 10.", { line: 3, name: ["p1"] }),
        step("*b가 나머지를 모은다", "*b gathers the rest", "1은 a가 되고, 남은 2, 3, 4는 리스트 b가 된다.", "1 becomes a, and the remaining 2, 3, and 4 become the list b.", { line: 4, name: ["src"], lane: lane("[1, 2, 3, 4]", "*가 붙은 이름은 리스트다.", "The starred name is a list.", [[cell("0", "1", "hot", "→ a"), cell("1", "2", "in", "→ b"), cell("2", "3", "in", "→ b"), cell("3", "4", "in", "→ b")]]) }),
        step("a는 1", "a is 1", "print가 1을 출력한다.", "print writes 1.", { line: 5, name: ["a1"] }),
        step("b는 나머지 리스트", "b is the rest as a list", "print가 [2, 3, 4]를 출력한다.", "print writes [2, 3, 4].", { line: 6, name: ["b1"] })
      ],
      terms: [
        [],
        [],
        ["(10,)"],
        ["(10,)", "10"],
        ["(10,)", "10"],
        ["(10,)", "10", "1"],
        ["(10,)", "10", "1", "[2, 3, 4]"]
      ]
    },
    dicts: {
      lines: [
        [w("menu"), w(" = "), w("{\"Burger\": 5500}", "m0")],
        [w("menu", "m1"), w("["), w("\"Pizza\"", "pz", "str"), w("] = "), w("8500", "price", "num")],
        [w("print", null, "fn"), w("("), w("menu", "m2"), w("["), w("\"Burger\"", "bg", "str"), w("])")],
        [w("del ", null, "kw"), w("menu", "m3"), w("["), w("\"Burger\"", "bg2", "str"), w("]")],
        [w("print", null, "fn"), w("("), w("menu.get", "gt", "fn"), w("(\"Burger\", 0)", "miss"), w(")")],
        [w("blank"), w(" = "), w("dict.fromkeys", "fk", "fn"), w("([\"a\"], 0)", "keys")],
        [w("blank.clear()", "cl")],
        [w("print", null, "fn"), w("("), w("blank", "bl"), w(")")]
      ],
      steps: [
        step("Burger는 5500", "Burger is 5500", "키 Burger와 값 5500으로 menu를 만든다.", "menu is created with key Burger and value 5500.", { line: 0, name: ["m0"], lane: lane("menu", "위는 키, 아래는 값이다.", "The top is the key and the bottom is the value.", [[cell("Burger", "5500", "hot", "")]]) }),
        step("Pizza 키를 추가한다", "Add the Pizza key", "없는 키에 대입하면 그 키가 생긴다. menu는 Burger와 Pizza를 가진다.", "Assigning to a missing key creates it. menu now holds Burger and Pizza.", { line: 1, name: ["m1"], idx: ["pz"], out: ["price"], lane: lane("menu", "Pizza가 이번 대입으로 추가된다.", "Pizza is added by this assignment.", [[cell("Burger", "5500", "in", ""), cell("Pizza", "8500", "hot", "")]]) }),
        step("Burger의 값을 출력한다", "Print Burger's value", "대괄호 안은 키가 된다. print가 5500을 출력한다.", "The brackets hold a key. print writes 5500.", { line: 2, name: ["m2"], idx: ["bg"] }),
        step("Burger를 지운다", "Delete Burger", "del은 Burger 키와 그 값을 지운다. 지운 값은 반환되지 않는다.", "del removes the Burger key and its value. The removed value is not returned.", { line: 3, name: ["m3"], idx: ["bg2"], lane: lane("menu", "Pizza만 남는다.", "Only Pizza remains.", [[cell("Pizza", "8500", "hot", "")]]) }),
        step("없는 키는 0", "A missing key is 0", "Burger는 이미 없다. get(\"Burger\", 0)은 KeyError 대신 기본값 0을 반환한다. menu는 바뀌지 않는다.", "Burger is already gone. get(\"Burger\", 0) returns the default 0 instead of raising KeyError. menu is unchanged.", { line: 4, name: ["gt"], idx: ["miss"] }),
        step("fromkeys가 a를 0으로", "fromkeys sets a to 0", "dict.fromkeys([\"a\"], 0)은 키 a와 값 0인 새 딕셔너리를 만든다.", "dict.fromkeys([\"a\"], 0) builds a new dictionary with key a and value 0.", { line: 5, name: ["fk"], idx: ["keys"], lane: lane("blank", "묶음의 원소가 키가 된다.", "Each element of the iterable becomes a key.", [[cell("a", "0", "hot", "")]]) }),
        step("clear가 비운다", "clear empties it", "clear는 blank의 키를 모두 지우고 None을 반환한다.", "clear deletes every key in blank and returns None.", { line: 6, name: ["cl"], lane: lane("blank", "칸이 없다.", "There are no cells.", [[cell("blank", "{}", "hot", "")]]) }),
        step("빈 딕셔너리를 출력한다", "Print the empty dictionary", "print가 {}를 출력한다.", "print writes {}.", { line: 7, name: ["bl"] })
      ],
      terms: [
        [],
        [],
        ["5500"],
        ["5500"],
        ["5500", "0"],
        ["5500", "0"],
        ["5500", "0"],
        ["5500", "0", "{}"]
      ]
    },
    sets: {
      lines: [
        [w("s"), w(" = "), w("{1, 2, 2}", "lit")],
        [w("t"), w(" = "), w("{2, 3}", "t0")],
        [w("print", null, "fn"), w("("), w("1 in s", "inn"), w(")")],
        [w("print", null, "fn"), w("("), w("sorted", null, "fn"), w("("), w("s & t", "inter"), w("))")],
        [w("print", null, "fn"), w("("), w("sorted", null, "fn"), w("("), w("s | t", "union"), w("))")],
        [w("u"), w(" = "), w("s.copy()", "cp")],
        [w("u.add", "ad", "fn"), w("("), w("9", "nine", "num"), w(")")],
        [w("u.discard", "dc", "fn"), w("("), w("9", "nine2", "num"), w(")")],
        [w("print", null, "fn"), w("("), w("u == {1, 2}", "eq"), w(")")]
      ],
      steps: [
        step("중복된 2는 한 번", "The repeated 2 is kept once", "{1, 2, 2}는 집합 {1, 2}가 된다. 빈 집합은 set()이고, {}는 빈 딕셔너리다.", "{1, 2, 2} becomes the set {1, 2}. An empty set is set(), and {} is an empty dictionary.", { line: 0, name: ["lit"], lane: lane("s", "같은 값은 한 칸만 남는다.", "An equal value is kept in only one cell.", [[cell("s", "1", "in", ""), cell("s", "2", "hot", "")]]) }),
        step("t는 {2, 3}", "t is {2, 3}", "비교에 쓸 집합 t를 만든다.", "t is created for the comparisons that follow.", { line: 1, name: ["t0"] }),
        step("1은 s에 있다", "1 is in s", "in은 원소가 있는지를 본다. print가 True를 출력한다.", "in asks whether the element is present. print writes True.", { line: 2, idx: ["inn"] }),
        step("교집합은 2", "The intersection is 2", "s & t는 양쪽에 있는 원소만 모은 새 집합이다. sorted로 보이면 [2]다. s와 t는 그대로다.", "s & t is a new set of the elements on both sides. Shown with sorted, it is [2]. s and t stay as they were.", { line: 3, idx: ["inter"] }),
        step("합집합은 1, 2, 3", "The union is 1, 2, 3", "s | t는 어느 한쪽에라도 있는 원소의 새 집합이다. 출력은 [1, 2, 3]이다.", "s | t is a new set of the elements on either side. The output is [1, 2, 3].", { line: 4, idx: ["union"] }),
        step("u는 s의 사본", "u is a copy of s", "copy는 새 집합을 반환한다. u와 s는 다른 객체다.", "copy returns a new set. u and s are different objects.", { line: 5, name: ["cp"] }),
        step("9를 더한다", "Add 9", "add(9)는 u에만 9를 넣는다. s는 {1, 2} 그대로다.", "add(9) inserts 9 into u only. s remains {1, 2}.", { line: 6, name: ["ad"], idx: ["nine"], lane: lane("u", "9는 u에만 있다.", "9 is only in u.", [[cell("u", "1", "in", ""), cell("u", "2", "in", ""), cell("u", "9", "hot", "")]]) }),
        step("없는 9가 아니므로 지운다", "9 is present, so it is removed", "discard(9)는 9를 지운다. 없었더라도 오류는 나지 않는다. u는 다시 {1, 2}다.", "discard(9) removes 9. A missing element would not raise an error. u is {1, 2} again.", { line: 7, name: ["dc"], idx: ["nine2"] }),
        step("u와 {1, 2}는 같다", "u equals {1, 2}", "== 는 같은 원소를 가졌는지 본다. print가 True를 출력한다.", "== asks whether the elements are the same. print writes True.", { line: 8, idx: ["eq"] })
      ],
      terms: [
        [],
        [],
        ["True"],
        ["True", "[2]"],
        ["True", "[2]", "[1, 2, 3]"],
        ["True", "[2]", "[1, 2, 3]"],
        ["True", "[2]", "[1, 2, 3]"],
        ["True", "[2]", "[1, 2, 3]"],
        ["True", "[2]", "[1, 2, 3]", "True"]
      ]
    },
    copy: {
      lines: [
        [w("a"), w(" = "), w("[[1], 2]", "a0")],
        [w("b"), w(" = "), w("a", "a1")],
        [w("c"), w(" = "), w("a.copy()", "cp")],
        [w("b.append", "ap", "fn"), w("("), w("3", "three", "num"), w(")")],
        [w("c", "c0"), w("["), w("0", "i0", "num"), w("]["), w("0", "i00", "num"), w("] = "), w("9", "nine", "num")],
        [w("import ", null, "kw"), w("copy", "mod")],
        [w("d"), w(" = "), w("copy.deepcopy", "dp", "fn"), w("("), w("a", "a2"), w(")")],
        [w("d", "d0"), w("[0][0] = "), w("0", "zero", "num")],
        [w("print", null, "fn"), w("("), w("a is b", "isb"), w(")")],
        [w("print", null, "fn"), w("("), w("a", "aprt"), w(")")],
        [w("print", null, "fn"), w("("), w("c", "cprt"), w(")")],
        [w("print", null, "fn"), w("("), w("d", "dprt"), w(")")]
      ],
      steps: [
        step("a는 [[1], 2]", "a is [[1], 2]", "바깥 리스트 안에 리스트 [1]과 수 2가 있다.", "The outer list holds the list [1] and the number 2.", { line: 0, name: ["a0"], lane: lane("a", "0번 칸이 리스트 [1]이다.", "Cell 0 is the list [1].", [[cell("0", "[1]", "hot", ""), cell("1", "2", "in", "")]]) }),
        step("b는 a와 같은 객체", "b is the same object as a", "대입은 리스트를 복사하지 않는다. b와 a는 같은 리스트를 가리킨다.", "Assignment does not copy the list. b and a refer to the same list.", { line: 1, name: ["a1"], lane: lane("a, b", "두 이름이 한 리스트를 가리킨다.", "Two names refer to one list.", [[cell("a", "[[1], 2]", "hot", ""), cell("b", "같은 객체", "in", "")]]) }),
        step("c는 바깥만 새 리스트", "c is a new outer list", "copy는 바깥 리스트만 새로 만든다. 0번 칸의 [1]은 a와 c가 함께 가리킨다.", "copy builds only a new outer list. Cell 0, [1], is still referred to by both a and c.", { line: 2, name: ["cp"], lane: lane("c", "바깥은 새 리스트, 안쪽 [1]은 공유다.", "The outer list is new. The inner [1] is shared.", [[cell("0", "[1] 공유", "hot", ""), cell("1", "2", "in", "")]]) }),
        step("append는 a와 b에만 보인다", "append is visible through a and b", "b.append(3)은 a와 b가 가리키는 그 리스트에 3을 붙인다. c의 바깥 칸 수는 그대로다. a는 [[1], 2, 3]이다.", "b.append(3) adds 3 to the list that a and b refer to. The number of outer cells in c stays the same. a is [[1], 2, 3].", { line: 3, name: ["ap"], idx: ["three"], lane: lane("a", "3은 a의 바깥에만 붙었다.", "3 was appended only on a's outer list.", [[cell("0", "[1]", "in", ""), cell("1", "2", "in", ""), cell("2", "3", "hot", "")]]) }),
        step("안쪽 리스트는 공유된다", "The inner list is shared", "c[0][0] = 9는 공유된 [1]의 0번을 9로 바꾼다. a의 0번도 [9]가 된다. a는 [[9], 2, 3]이고 c는 [[9], 2]다.", "c[0][0] = 9 changes cell 0 of the shared [1] to 9. Cell 0 of a becomes [9] too. a is [[9], 2, 3] and c is [[9], 2].", { line: 4, name: ["c0"], idx: ["i0", "i00"], out: ["nine"], lane: lane("안쪽", "a[0]과 c[0]은 같은 리스트다.", "a[0] and c[0] are the same list.", [[cell("a[0]", "[9]", "hot", ""), cell("c[0]", "[9]", "in", "")]]) }),
        step("copy 모듈을 불러온다", "Load the copy module", "깊은 복사 함수 deepcopy는 copy 모듈에 있다.", "The deep-copy function deepcopy lives in the copy module.", { line: 5, name: ["mod"] }),
        step("안쪽까지 새로 만든다", "The inside is built anew", "deepcopy는 바깥과 안쪽 리스트를 모두 새로 만든다. d는 [[9], 2, 3]이고 a[0]과 d[0]은 다른 리스트다.", "deepcopy builds both the outer list and the inner list anew. d is [[9], 2, 3], and a[0] and d[0] are different lists.", { line: 6, name: ["dp", "a2"] }),
        step("d만 0으로 바뀐다", "Only d becomes 0", "d[0][0] = 0은 d의 안쪽 리스트만 고친다. a는 [[9], 2, 3]으로 남는다.", "d[0][0] = 0 edits only the inner list of d. a remains [[9], 2, 3].", { line: 7, name: ["d0"], idx: ["zero"], lane: lane("d", "d의 안쪽은 a와 다른 리스트다.", "The inside of d is a different list from a.", [[cell("d[0]", "[0]", "hot", ""), cell("a[0]", "[9]", "in", "")]]) }),
        step("a is b는 True", "a is b is True", "a와 b는 같은 객체이므로 True가 출력된다.", "a and b are the same object, so True is printed.", { line: 8, idx: ["isb"] }),
        step("a를 출력한다", "Print a", "a는 [[9], 2, 3]이다. 안쪽 9는 c와 공유된 수정이고, 3은 b를 통한 append다.", "a is [[9], 2, 3]. The inner 9 is the edit shared with c, and 3 is the append made through b.", { line: 9, name: ["aprt"] }),
        step("c를 출력한다", "Print c", "c는 [[9], 2]다. append한 3은 c의 바깥에 없다.", "c is [[9], 2]. The appended 3 is not on c's outer list.", { line: 10, name: ["cprt"] }),
        step("d를 출력한다", "Print d", "d는 [[0], 2, 3]이다. 0으로 바꾼 것은 d의 안쪽뿐이다.", "d is [[0], 2, 3]. The change to 0 is only inside d.", { line: 11, name: ["dprt"] })
      ],
      terms: [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        ["True"],
        ["True", "[[9], 2, 3]"],
        ["True", "[[9], 2, 3]", "[[9], 2]"],
        ["True", "[[9], 2, 3]", "[[9], 2]", "[[0], 2, 3]"]
      ]
    }
  };

  var titles = {
    io: ["통합 코드", "Combined code"],
    values: ["통합 코드", "Combined code"],
    convert: ["통합 코드", "Combined code"],
    ops: ["통합 코드", "Combined code"],
    cond: ["통합 코드", "Combined code"],
    modules: ["통합 코드", "Combined code"],
    loops: ["통합 코드", "Combined code"],
    indexing: ["통합 코드", "Combined code"],
    strings: ["통합 코드", "Combined code"],
    funcs: ["통합 코드", "Combined code"],
    lists: ["통합 코드", "Combined code"],
    tuples: ["통합 코드", "Combined code"],
    dicts: ["통합 코드", "Combined code"],
    sets: ["통합 코드", "Combined code"],
    copy: ["통합 코드", "Combined code"]
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
      var key = document.createElement("p");
      key.className = "lane-key";
      var numeric = item.lane.rows.some(function (row) {
        return row.some(function (piece) {
          return /^-?\d+$/.test(piece.i);
        });
      });
      var hasTo = item.lane.rows.some(function (row) {
        return row.some(function (piece) {
          return piece.to;
        });
      });
      if (lang() === "en") {
        key.textContent = numeric
          ? (hasTo ? "Top number: index, starting at 0. Middle: the value in that cell. Bottom: where that value goes." : "Top number: index, starting at 0. Bottom: the value in that cell.")
          : "Top: the key. Bottom: that key's value.";
      } else {
        key.textContent = numeric
          ? (hasTo ? "위 숫자: 칸 번호. 0이 첫 칸이다. 가운데: 그 칸의 값. 아래: 그 값이 들어가는 곳." : "위 숫자: 칸 번호. 0이 첫 칸이다. 아래: 그 칸의 값.")
          : "위: 키. 아래: 그 키의 값.";
      }
      box.appendChild(key);
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
          if (piece.to) {
            var toEl = document.createElement("span");
            toEl.className = "cell-to";
            toEl.textContent = piece.to;
            cellEl.appendChild(toEl);
          }
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
    var termBody = root.querySelector(".walk-term-body");
    termBody.textContent = "";
    var rows = (walk.terms && walk.terms[index]) || [];
    if (!rows.length) {
      var empty = document.createElement("p");
      empty.className = "term-empty";
      empty.textContent = lang() === "en" ? "no output" : "출력 없음";
      termBody.appendChild(empty);
    } else {
      rows.forEach(function (row) {
        var line = document.createElement("div");
        var text = row;
        var kind = "out";
        if (row.charAt(0) === ">") {
          kind = "in";
          text = row.slice(1);
        } else if (row.charAt(0) === "=") {
          kind = "echo";
          text = row.slice(1);
        }
        line.className = "term-line term-" + kind;
        line.textContent = text;
        termBody.appendChild(line);
      });
    }
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
    var termToggle = document.createElement("button");
    termToggle.type = "button";
    termToggle.className = "term-toggle";
    termToggle.setAttribute("aria-expanded", "false");
    var term = document.createElement("aside");
    term.className = "walk-term";
    var termBar = document.createElement("div");
    termBar.className = "term-bar";
    var termLabel = document.createElement("span");
    termLabel.className = "term-label";
    var termClose = document.createElement("button");
    termClose.type = "button";
    termClose.className = "term-close";
    var termBody = document.createElement("div");
    termBody.className = "walk-term-body";
    termBar.appendChild(termLabel);
    termBar.appendChild(termClose);
    term.appendChild(termBar);
    term.appendChild(termBody);
    function setTerm(open) {
      root.classList.toggle("is-term", open);
      termToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    termToggle.addEventListener("click", function () {
      setTerm(!root.classList.contains("is-term"));
    });
    termClose.addEventListener("click", function () {
      setTerm(false);
    });
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
    nav.appendChild(termToggle);
    var stage = document.createElement("div");
    stage.className = "walk-stage";
    stage.appendChild(pre);
    stage.appendChild(nav);
    stage.appendChild(term);
    body.appendChild(stage);
    body.appendChild(laneBox);
    body.appendChild(stepTitle);
    body.appendChild(stepNote);
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
      prev.textContent = "▲";
      next.textContent = "▼";
      prev.setAttribute("aria-label", ko ? "이전" : "Previous");
      next.setAttribute("aria-label", ko ? "다음" : "Next");
      termToggle.textContent = ko ? "결과" : "Out";
      termLabel.textContent = ko ? "출력" : "Output";
      termClose.textContent = ko ? "닫기" : "Close";
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
