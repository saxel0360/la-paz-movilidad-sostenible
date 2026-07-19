import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Modal,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { geocodingService } from '../../services/geocodingService';
import { COLORS } from '../../constants/colors';

export const SearchBar = ({
    onPlaceSelect,
    placeholder = 'Buscar destino...',
    initialValue = '',
    icon = '🔍'
}) => {
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const timeoutRef = useRef(null);

    // Búsqueda con debounce
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (query.length < 3) {
            setResults([]);
            setShowResults(false);
            return;
        }

        timeoutRef.current = setTimeout(async () => {
            await performSearch(query);
        }, 500);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [query]);

    const performSearch = async (searchQuery) => {
        try {
            setIsLoading(true);
            setError(null);
            const places = await geocodingService.searchPlaces(searchQuery);
            setResults(places);
            setShowResults(places.length > 0);
        } catch (err) {
            setError('Error al buscar lugares');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPlace = (place) => {
        setQuery(place.nombre);
        setShowResults(false);
        setResults([]);
        Keyboard.dismiss();
        if (onPlaceSelect) {
            onPlaceSelect(place);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const renderResultItem = ({ item }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelectPlace(item)}
            activeOpacity={0.7}
        >
            <Text style={styles.resultIcon}>📍</Text>
            <View style={styles.resultContent}>
                <Text style={styles.resultName} numberOfLines={1}>
                    {item.nombre.split(',')[0]}
                </Text>
                <Text style={styles.resultAddress} numberOfLines={1}>
                    {item.nombre.split(',').slice(1).join(',').trim() || 'La Paz, Bolivia'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>{icon}</Text>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.GRAY_500}
                    value={query}
                    onChangeText={setQuery}
                    onFocus={() => {
                        if (results.length > 0) {
                            setShowResults(true);
                        }
                    }}
                    returnKeyType="search"
                    onSubmitEditing={() => {
                        if (results.length > 0) {
                            handleSelectPlace(results[0]);
                        }
                    }}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                        <Text style={styles.clearText}>✕</Text>
                    </TouchableOpacity>
                )}
                {isLoading && (
                    <ActivityIndicator
                        size="small"
                        color={COLORS.PRIMARY}
                        style={styles.loader}
                    />
                )}
            </View>

            {/* Resultados flotantes */}
            {showResults && results.length > 0 && (
                <View style={styles.resultsContainer}>
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderResultItem}
                        keyboardShouldPersistTaps="handled"
                        maxHeight={200}
                        showsVerticalScrollIndicator={true}
                    />
                </View>
            )}

            {/* Mensaje de error */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 100,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.GRAY_200,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.GRAY_900,
        paddingVertical: 4,
    },
    clearButton: {
        padding: 4,
        marginLeft: 4,
    },
    clearText: {
        fontSize: 16,
        color: COLORS.GRAY_500,
        fontWeight: 'bold',
    },
    loader: {
        marginLeft: 8,
    },
    resultsContainer: {
        position: 'absolute',
        top: 52,
        left: 0,
        right: 0,
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: COLORS.GRAY_200,
        zIndex: 200,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_100,
    },
    resultIcon: {
        fontSize: 16,
        marginRight: 12,
    },
    resultContent: {
        flex: 1,
    },
    resultName: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.GRAY_900,
    },
    resultAddress: {
        fontSize: 12,
        color: COLORS.GRAY_500,
        marginTop: 1,
    },
    errorContainer: {
        marginTop: 4,
        paddingHorizontal: 12,
    },
    errorText: {
        fontSize: 12,
        color: COLORS.ERROR,
    },
});