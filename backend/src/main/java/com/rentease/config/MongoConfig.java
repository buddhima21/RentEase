package com.rentease.config;

import com.rentease.common.enums.BookingStatus;
import com.rentease.common.enums.PropertyStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.Arrays;

@Configuration
public class MongoConfig {

    @ReadingConverter
    public static class PropertyStatusReadConverter implements Converter<String, PropertyStatus> {
        @Override
        public PropertyStatus convert(String source) {
            return PropertyStatus.fromValue(source);
        }
    }

    @ReadingConverter
    public static class BookingStatusReadConverter implements Converter<String, BookingStatus> {
        @Override
        public BookingStatus convert(String source) {
            if (source == null) return BookingStatus.PENDING;
            try {
                return BookingStatus.valueOf(source.toUpperCase());
            } catch (IllegalArgumentException e) {
                return BookingStatus.PENDING;
            }
        }
    }

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(Arrays.asList(
                new PropertyStatusReadConverter(),
                new BookingStatusReadConverter()
        ));
    }
}
