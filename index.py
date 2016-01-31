from flask import Flask, render_template, request, Markup, jsonify

import json, time

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/heatmap')
def heatmap():
    return render_template('heat_map.html')

@app.route('/parallel-coordinates')
def parallel_coordinates():
    return render_template('parallel_coordinates.html')

@app.route('/getArticlesByAuthor/<author_name>')
def get_articles_by_author(author_name = 'Xiaoou Tang'):
    nearest_author = "Dalei Li"
    articles_html = "<p>Hi~</p>"
    return render_template('articles.html', author_name = nearest_author, articles = Markup(articles_html))

if __name__ == '__main__':
    app.run(port = 5000)
