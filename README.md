# Video Liking and Categorization App

## Overview

This project is a web application that allows users to submit, like, and categorize YouTube videos directly pulled from YouTube. Users can create an account, log in, manage their liked videos, and for admins, add and edit categories and accept user submitted videos to be visible for everyone on the website. The point of the website is to submit and watch mildly interesting videos about many different topics from youtube, in an educational matter, without the need to search for something specific on youtube.
The frontend is built with React, while the backend is developed using Django REST Framework.
my linkdin - https://www.linkedin.com/in/maxim-voropaev-8080a632b/
Docker of this project - https://hub.docker.com/r/maxim3003/mainproject

## Features

- **User Authentication**: Register, log in, and manage accounts with JWT authentication.
- **Video Submission**: Users can submit YouTube video links.
- **Video Liking**: Users can like videos, with buttons changing from "Like" to "Liked" once clicked and be saved on the profile page once the video is liked.
- **Profile Management**: Users can view and manage their liked videos, change passwords in the profile page.
- **Category Management**: Admins can add, view, and edit video categories.
- **Responsive Design**: The app is designed to be user-friendly and responsive across devices.
- **Admin Privileges**: Admins can see all videos, approved, unapproved and denied videos, in a sense they are choosing what normal users are allowed to see on the website
- **Trending From YouTube**: Takes trending videos from Youtube every day
- **Recommended**: Simple algorithm to suggest videos to users

## Technologies Used

- **Frontend**: React, React Router, Axios, JWT Decode
- **Backend**: Django, Django REST Framework
- **Database**: PostgreSQL/MySQL
- **API**: YouTube oEmbed API for fetching video details
- **HuggingFace AI**: Uses AI to categorize videos from youtube and fix their description


