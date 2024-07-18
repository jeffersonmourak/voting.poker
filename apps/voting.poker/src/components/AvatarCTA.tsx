import React, {useEffect, useRef, useState} from 'react';
import {Subscription} from 'rxjs';
import {styled} from '@mui/material/styles';
import Tooltip, {TooltipProps, tooltipClasses} from '@mui/material/Tooltip';
import {avatarMessagesObservable} from '../observables/avatarMessagesObservable';

const AvatarTooltip = styled(({className, ...props}: TooltipProps) => (
  <Tooltip {...props} classes={{popper: className}} />
))(({theme}) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    textAlign: 'center',
    padding: theme.spacing(2),
  },
}));

interface AvatarCTAProps {
  disabled?: boolean;
  children: React.ReactElement<any, any>;
}

const useMessages = (disabled = false) => {
  const [data, setData] = useState<{
    message?: string;
    open: boolean;
    disabled?: boolean;
  }>({
    open: false,
    disabled,
  });
  const messageSubscription = useRef<Subscription>();

  const unsubscribe = () => {
    messageSubscription.current?.unsubscribe();
  };

  useEffect(() => {
    messageSubscription.current = avatarMessagesObservable.subscribe(({message, action}) => {
      setData({
        message,
        open: action === 'display',
      });
    });

    return () => {
      messageSubscription.current?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      messageSubscription.current?.unsubscribe();
      setData((prev) => ({
        ...prev,
        open: false,
        disabled,
      }));
    }
  }, [disabled]);

  return {
    ...data,
    unsubscribe,
  };
};

export const AvatarCTA = ({children, disabled}: AvatarCTAProps) => {
  const {message, open} = useMessages(disabled);
  return (
    <AvatarTooltip disableHoverListener placement="top" open={open} title={message ?? ''}>
      {children}
    </AvatarTooltip>
  );
};
