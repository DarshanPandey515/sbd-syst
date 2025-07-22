import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register premium fonts for a sophisticated look
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc9.ttf', fontWeight: 'bold' },
        { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'black' },
    ],
});

// Define styles with premium color palette and space optimization
const styles = StyleSheet.create({
    page: {
        padding: 30, // Reduced from 40
        fontFamily: 'Roboto',
        backgroundColor: '#F8F1E9',
        color: '#1A1A1A',
    },
    header: {
        backgroundColor: '#9B1D20',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
    },
    heading: {
        fontSize: 22, // Reduced from 26
        fontWeight: 'black',
        color: '#FFFFFF',
        marginBottom: 8, // Reduced from 10
        letterSpacing: 0.5,
    },
    subheading: {
        fontSize: 12, // Reduced from 14
        color: '#E8ECEF',
        opacity: 0.95,
        fontWeight: 'normal',
        letterSpacing: 0.2,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12, // Reduced from 20
        marginBottom: 15, // Reduced from 25
        borderWidth: 1,
        borderColor: '#D4D4D4',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2B2D2F', // Deep charcoal
        padding: 8, // Reduced from 12
        borderRadius: 6,
        marginBottom: 6, // Reduced from 10
    },
    tableHeaderText: {
        fontSize: 10, // Reduced from 12
        fontWeight: 'bold',
        color: '#F8F1E9', // Soft ivory
        flex: 1,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    row: {
        flexDirection: 'row',
        padding: 8, // Reduced from 12
        borderBottomWidth: 0.5, // Thinner border
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
    },
    rowGold: {
        flexDirection: 'row',
        padding: 8, // Reduced from 12
        backgroundColor: '#f5e093', // Premium gold
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
        borderRadius: 4,
    },
    rowSilver: {
        flexDirection: 'row',
        padding: 8, // Reduced from 12
        backgroundColor: '#F5F5F5', // Premium silver
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
        borderRadius: 4,
    },
    rowBronze: {
        flexDirection: 'row',
        padding: 8, // Reduced from 12
        backgroundColor: '#FCEDE3', // Premium bronze
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
        borderRadius: 4,
    },
    cell: {
        flex: 1,
        fontSize: 9, // Reduced from 11
        color: '#1A1A1A', // Deep charcoal
        textAlign: 'center',
        fontWeight: 'normal',
    },
    rankCell: {
        flex: 0.5,
        fontSize: 9, // Reduced from 11
        color: '#9B1D20', // Premium crimson
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cellHighlight: {
        flex: 1,
        fontSize: 9, // Reduced from 11
        color: '#1A1A1A',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    rankCellHighlight: {
        flex: 0.5,
        fontSize: 9, // Reduced from 11
        color: '#1A1A1A',
        fontWeight: 'black',
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 15, // Reduced from 20
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8, // Reduced from 10
        color: '#4B5EAA',
        borderTopWidth: 0.5, // Thinner border
        borderTopColor: '#D4D4D4',
        paddingTop: 8, // Reduced from 12
        fontWeight: 'normal',
    },
});

const ResultPDF = ({ meet, participants }) => (
    <Document>
        <Page style={styles.page} size="A4">
            <View style={styles.header}>
                <Text style={styles.heading}>{meet.name} Results</Text>
                <Text style={styles.subheading}>
                    {new Date(meet.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })} • {meet.venue.name}
                </Text>
            </View>
            <View style={styles.section}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>Rank</Text>
                    <Text style={styles.tableHeaderText}>Name</Text>
                    <Text style={styles.tableHeaderText}>Weight</Text>
                    <Text style={styles.tableHeaderText}>Total</Text>
                    <Text style={styles.tableHeaderText}>GI Score</Text>
                </View>
                {participants.map((p, index) => {
                    const rowStyle =
                        index === 0 ? styles.rowGold :
                            index === 1 ? styles.rowSilver :
                                index === 2 ? styles.rowBronze :
                                    styles.row;
                    const cellStyle = index < 3 ? styles.cellHighlight : styles.cell;
                    const rankCellStyle = index < 3 ? styles.rankCellHighlight : styles.rankCell;
                    return (
                        <View style={rowStyle} key={index}>
                            <Text style={rankCellStyle}>{index + 1}</Text>
                            <Text style={cellStyle}>{p.name}</Text>
                            <Text style={cellStyle}>{p.body_weight}kg</Text>
                            <Text style={cellStyle}>{p.totalLifted}kg</Text>
                            <Text style={cellStyle}>{p.giScore}</Text>
                        </View>
                    );
                })}
            </View>
            <Text style={styles.footer}>
                Generated by RIG Powerlifting Software • {new Date().toLocaleDateString()}
            </Text>
        </Page>
    </Document>
);

export default ResultPDF;