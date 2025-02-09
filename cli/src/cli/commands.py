import click
import json
import requests

API_URL = "http://localhost:3000/api"  # Update with your backend URL

@click.group()
def cli():
    """WhisperrNote CLI"""
    pass

@cli.command()
@click.option('--content', prompt='Note content')
def create_note(content):
    """Create a new note"""
    try:
        response = requests.post(f"{API_URL}/notes", json={'content': content})
        response.raise_for_status()
        click.echo('Note created successfully!')
    except Exception as e:
        click.echo(f'Error creating note: {str(e)}', err=True)

@cli.command()
def list_notes():
    """List all notes"""
    try:
        response = requests.get(f"{API_URL}/notes")
        response.raise_for_status()
        notes = response.json()
        click.echo(json.dumps(notes, indent=2))
    except Exception as e:
        click.echo(f'Error listing notes: {str(e)}', err=True)

if __name__ == '__main__':
    cli()
