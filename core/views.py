from django.shortcuts import render


def index(request, graph_data=None):
    """ Main view, return blank graph editor """

    context = {
        'graph_data': graph_data
    }

    return render(request, "index.html", context)


def open_file(request):
    """ Open given file (if present) and try to render it as a graph """

    raise NotImplementedError()
