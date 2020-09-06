/* eslint-disable prettier/prettier */
import firebase from 'react-native-firebase';

class FCMService {
  // we use this method to register notification service in our app.
  // we call this method in componetDidMount() so, we app load we get permission to
  // display notification.
  register = (onRegister, onNotification, onOpenNotification) => {
    this.checkPermission(onRegister);
    // when register function call that time we create notification listener
    this.createNoitificationListeners(
      onRegister,
      onNotification,
      onOpenNotification,
    );
  };

  checkPermission = (onRegister) => {
    firebase
      .messaging()
      .hasPermission()
      .then((enabled) => {
        if (enabled) {
          //user has permission
          this.getToken(onRegister);
        } else {
          //user don't have permission
          this.requestPermission(onRegister);
        }
      })
      .catch((error) => {
        console.log('Permission rejected', error);
      });
  };

  getToken = (onRegister) => {
    firebase
      .messaging()
      .getToken()
      .then((fcmToken) => {
        if (fcmToken) {
          onRegister(fcmToken);
        } else {
          console.log('User does not have a device token');
        }
      })
      .catch((error) => {
        console.log('getToken rejected ', error);
      });
  };

  requestPermission = (onRegister) => {
    firebase
      .messaging()
      .requestPermission()
      .then(() => {
        this.getToken(onRegister);
      })
      .catch((error) => {
        console.log('Requested persmission rejected ', error);
      });
  };

  deletedToken = () => {
    firebase
      .messaging()
      .deleteToken()
      .catch((error) => {
        console.log('Delected token error ', error);
      });
  };

  createNoitificationListeners = (
    onRegister,
    onNotification,
    onOpenNotification,
  ) => {
    // This listener triggered when notification has been received in foreground
    this.notificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        onNotification(notification);
      });

    // This listener triggered when app is in backgound and we click, tapped and opened notifiaction
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen) => {
        console.log(notificationOpen);
        if (notificationOpen) {
          const notification = notificationOpen.notification;
          onOpenNotification(notification);
          this.removeDelieveredNotification(notification);
        }
      });

    // This listener triggered when app is closed and we click,tapped and opened notification
    firebase
      .notifications()
      .getInitialNotification()
      .then((notificationOpen) => {
        if (notificationOpen) {
          const notification = notificationOpen.notification;
          onOpenNotification(notification);
          this.removeDelieveredNotification(notification);
        }
      });

    // Triggered for data only payload  in foreground
    this.messageListener = firebase.messaging().onMessage((message) => {
      onNotification(message);
    });

    // This listener triggered when new token
    this.onTokenRefreshListener = firebase
      .messaging()
      .onTokenRefresh((fcmToken) => {
        console.log('FCM new token: ', fcmToken);
        onRegister(fcmToken);
      });
  };

  buildChannel = (obj) => {
    return new firebase.notifications.Android.Channel(
      obj.channelId,
      obj.channelName,
      firebase.notifications.Android.Importance.High,
    ).setDescription(obj.channelDes);
  };

  buildNotification = (obj) => {
    console.log(obj);
    firebase.notifications().android.createChannel(obj.channel);

    const notification = new firebase.notifications.Notification()
      .setSound(obj.sound)
      .setNotificationId(obj.dataId)
      .setTitle(obj.title)
      .setBody(obj.content)
      .setData(obj.data)
      .android.setChannelId(obj.channel.channelId)
      .android.setLargeIcon(obj.largeIcon)
      .android.setSmallIcon(obj.smallIcon)
      .android.setColor(obj.colorBgIcon)
      .android.setPriority(firebase.notifications.Android.Priority.High)
      .android.setVibrate(obj.vibrate)
      .android.setAutoCancel(true);

    return notification;
  };

  scheduleNotification = (notification, datetime) => {
    const date = new Date(datetime);
    firebase
      .notifications()
      .scheduleNotification(notification, {fireDate: date.getTime()});
  };

  displayNotification = (notification) => {
    firebase
      .notifications()
      .displayNotification(notification)
      .catch((error) => {
        console.log('Display Notification error', error);
      });
  };

  removeDelieveredNotification = (notification) => {
    firebase
      .notifications()
      .removeDeliveredNotification(notification.notificationId);
  };
}
export const fcmService = new FCMService();
