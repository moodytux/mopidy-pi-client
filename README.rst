****************************
Mopidy-Pi-Client
****************************

.. image:: https://img.shields.io/pypi/v/Mopidy-Pi-Client.svg?style=flat
    :target: https://pypi.python.org/pypi/Mopidy-Pi-Client/
    :alt: Latest PyPI version

.. image:: https://img.shields.io/travis/moodytux/mopidy-pi-client/master.svg?style=flat
    :target: https://travis-ci.org/moodytux/mopidy-pi-client
    :alt: Travis CI build status

.. image:: https://img.shields.io/coveralls/moodytux/mopidy-pi-client/master.svg?style=flat
   :target: https://coveralls.io/r/moodytux/mopidy-pi-client
   :alt: Test coverage

Mopidy extension specifically for the Raspberry Pi Touchscreen. Developed and tested under Firefox running in fullscreen mode.


Screenshots
===========

.. image:: /screenshots/album-info-screen.png
.. image:: /screenshots/album-list-screen.png
.. image:: /screenshots/loading-screen.png


Installation
============

Currently, this plugin in is development so you will need to clone this repo and run::

    sudo pip install -e mopidy-pi-client

Eventually you will be able to install by running::

    pip install Mopidy-Pi-Client


Configuration
=============

Before starting Mopidy, you must add configuration for
Mopidy-Pi-Client to your Mopidy configuration file::

    [pi-client]
    enabled = true

Load a web browser up and go to: http://<configured_ip>:<configured_port>/pi-client/html/


Feature roadmap
===============

- Show track artist on a Various Artists album info screen
- Look into possibility of removing cursor to be more touch friendly
- Adding gesture support to the track list on the album info screen
- Selecting albums by genre
- Provide a refresh button for refreshing album list
- Providing track duration and elapsed time information
- Integration with Deezer to find new music by the same artist


Development
===========

To develop on mopidy-pi-client, there is a ready made Vagrantfile and Ansible playbook to setup a working environment in VirtualBox:

- Add some music to the vagrant/music sub-directory to test with
- Get your environment up and running by typing in a terminal::

    cd <repo_path>/vagrant
    vagrant up

- See your environment in a browser by going to http://192.168.33.10:6680/pi-client/html/
- Run the unit tests by typing in a terminal::

    cd <repo_path>/vagrant
    vagrant ssh
    sudo su - mopidy
    cd /mopidy-pi-client
    qunit


Project resources
=================

- `Source code <https://github.com/moodytux/mopidy-pi-client>`_
- `Issue tracker <https://github.com/moodytux/mopidy-pi-client/issues>`_


Credits
=======

- Original author: `Stephen Kirkby <https://github.com/moodytux>`_
- Current maintainer: `Stephen Kirkby <https://github.com/moodytux>`_
- `Contributors <https://github.com/moodytux/mopidy-pi-client/graphs/contributors>`_


Changelog
=========

v0.3.0
----------------------------------------

- Added a progress bar on the current track to indicate elapsed playing time.
- Code refactoring to have unit tested playback state.
- Updating Ansible scripts to provide latest NodeJS for use with tests.

v0.2.0
----------------------------------------

- New category flow selector to allow scrolling to artists starting with a given letter. This is also linked to the cover flow selector so scrolling through covers changes the artist letter and similarly scrolling through letters scrolls to the first artists first cover. Written to be extensible for future category types such as genres.
- Refactored all code to use requirejs, so everything is much more modular and maintainable.
- Added a Vagrantfile to provide a working development environment, utilising Ansible for provisioning.
- Added Mocha unit tests for most modules, runnable in the development environment.

v0.1.1
----------------------------------------

- Bugfix to the album info back button state, it should always be enabled.

v0.1.0
----------------------------------------

- Initial release.
