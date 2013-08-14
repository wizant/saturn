from flask import Flask, request, render_template, send_from_directory, render_template

app = Flask(__name__, static_url_path='', static_folder='static')

@app.route('/')
def index(name=None):
	# return app.send_static_file('index.html')
	return render_template('index.html', name=name)

@app.route('/post/<int:post_id>')
def show_post(post_id):
    # show the post with the given id, the id is an integer
    return 'Post %d' % post_id

@app.route('/robots.txt')
def static_from_root():
    return send_from_directory(app.static_folder, request.path[1:])

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
