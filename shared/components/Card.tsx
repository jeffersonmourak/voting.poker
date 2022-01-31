import {ButtonBase, Box, Theme, lighten, Typography, alpha, colors} from '@mui/material';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {cx} from '@emotion/css';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: '100%',
        backgroundColor: lighten(theme.palette.primary.main, 0.1),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(8, 0, 6),
        gap: theme.spacing(4),
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
    },
    value: {
        backgroundColor: alpha(colors.common.white, 0.6),
        minWidth: theme.spacing(10),
        minHeight: theme.spacing(10),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: (theme.shape.borderRadius as number) * 4,
    },
    topValue: {
        position: 'absolute',
        top: theme.spacing(2),
        fontFamily: theme.typography.fontFamily,
    },
    bottomValue: {
        position: 'absolute',
        bottom: theme.spacing(2),
        fontFamily: theme.typography.fontFamily,
        transform: `rotate(180deg)`,
    },
    left: {
        left: theme.spacing(2),
    },
    right: {
        right: theme.spacing(2),
    },
    selected: {
        backgroundColor: lighten(theme.palette.success.main, 0.2),
    },
}));

interface CardProps {
    value: string;
    selected?: boolean;
    onClick?: () => void;
}

const Card = ({value, selected, onClick = () => {}}: CardProps) => {
    const classes = useStyles();
    return (
        <ButtonBase className={cx(classes.root, {[classes.selected]: selected})} onClick={onClick}>
            <Box className={cx(classes.topValue, classes.left)}>
                <Typography variant="button">{value}</Typography>
            </Box>
            <Box className={cx(classes.topValue, classes.right)}>
                <Typography variant="button">{value}</Typography>
            </Box>
            <Box className={classes.value}>
                <Typography variant="h4">{value}</Typography>
            </Box>
            <Box className={cx(classes.bottomValue, classes.left)}>
                <Typography variant="button">{value}</Typography>
            </Box>
            <Box className={cx(classes.bottomValue, classes.right)}>
                <Typography variant="button">{value}</Typography>
            </Box>
        </ButtonBase>
    );
};

export default Card;
