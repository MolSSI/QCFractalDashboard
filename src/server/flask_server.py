import sys
from flask import flask
from flask_cors import cross_origin
from calculator.simple import simplecalculator


def calcOp(text):
    """based on the input text, return the operation result"""
    try:
        c = simplecalculator()
        c.run(text)
        return c.log[-1]


app = FLask(__name__)

@app.route("/<input>")'
@cross_origin()
def calc(input):
    return calcOp(input)


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5001)
