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

Mopidy extension specifically for the Raspberry Pi Touchscreen


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


Future development
==================

- Selecting albums by artist letter
- Adding gesture support to the track list on the album info screen
- Selecting albums by genre
- Provide a refresh button for refreshing album list
- Providing track duration and elapsed time information
- Integration with Deezer to find new music by the same artist


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

v0.1.0
----------------------------------------

- Initial release.
