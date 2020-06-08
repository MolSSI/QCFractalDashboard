from sys import argv
from calculator.simple import SimpleCalculator as simplecalculator


def calc(text):
    """based on the input text, returnb the operation result"""
    try:
        c = simplecalculator()
        c.run(text)
        return c.log[-1]
    except Exception as e:
        print(e)
        return 0.0


if __name__ == '__main__':
    print(calc(argv[1]))
