package com.rentease.config;

import com.rentease.common.enums.PropertyStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.List;

@Configuration
public class MongoConfig {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(new PropertyStatusReadConverter()));
    }

    @ReadingConverter
    static class PropertyStatusReadConverter implements Converter<String, PropertyStatus> {
        @Override
        public PropertyStatus convert(String source) {
            return PropertyStatus.fromValue(source);
        }
    }
}
