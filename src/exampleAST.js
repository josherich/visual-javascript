export const exampleAST = {
  type: "Program",
  start: 0,
  end: 255,
  body: [
    {
      type: "VariableDeclaration",
      start: 179,
      end: 190,
      declarations: [
        {
          type: "VariableDeclarator",
          start: 183,
          end: 189,
          id: {
            type: "Identifier",
            start: 183,
            end: 184,
            name: "a"
          },
          init: {
            type: "Literal",
            start: 187,
            end: 189,
            value: 42,
            raw: "42"
          }
        }
      ],
      kind: "var"
    },
    {
      type: "VariableDeclaration",
      start: 191,
      end: 201,
      declarations: [
        {
          type: "VariableDeclarator",
          start: 195,
          end: 200,
          id: {
            type: "Identifier",
            start: 195,
            end: 196,
            name: "b"
          },
          init: {
            type: "Literal",
            start: 199,
            end: 200,
            value: 5,
            raw: "5"
          }
        }
      ],
      kind: "var"
    },
    {
      type: "FunctionDeclaration",
      start: 202,
      end: 238,
      id: {
        type: "Identifier",
        start: 211,
        end: 215,
        name: "addA"
      },
      expression: false,
      generator: false,
      async: false,
      params: [
        {
          type: "Identifier",
          start: 216,
          end: 217,
          name: "d"
        }
      ],
      body: {
        type: "BlockStatement",
        start: 219,
        end: 238,
        body: [
          {
            type: "ReturnStatement",
            start: 223,
            end: 236,
            argument: {
              type: "BinaryExpression",
              start: 230,
              end: 235,
              left: {
                type: "Identifier",
                start: 230,
                end: 231,
                name: "a"
              },
              operator: "+",
              right: {
                type: "Identifier",
                start: 234,
                end: 235,
                name: "d"
              }
            }
          }
        ]
      }
    },
    {
      type: "ExpressionStatement",
      start: 239,
      end: 255,
      expression: {
        type: "AssignmentExpression",
        start: 239,
        end: 254,
        operator: "=",
        left: {
          type: "Identifier",
          start: 239,
          end: 240,
          name: "c"
        },
        right: {
          type: "BinaryExpression",
          start: 243,
          end: 254,
          left: {
            type: "CallExpression",
            start: 243,
            end: 250,
            callee: {
              type: "Identifier",
              start: 243,
              end: 247,
              name: "addA"
            },
            arguments: [
              {
                type: "Literal",
                start: 248,
                end: 249,
                value: 2,
                raw: "2"
              }
            ],
            optional: false
          },
          operator: "+",
          right: {
            type: "Identifier",
            start: 253,
            end: 254,
            name: "b"
          }
        }
      }
    }
  ],
  sourceType: "module"
};
